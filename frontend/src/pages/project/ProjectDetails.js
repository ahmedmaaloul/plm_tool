import React, { useEffect, useContext, useState } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import CreateBOMForm from '../../components/bom/CreateBOMForm';

const Container = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #ff5757;
  margin-bottom: 20px;
`;

const SubTitle = styled.h3`
  color: #ff5757;
  margin-bottom: 15px;
`;

const Button = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;
`;

const WorkflowContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const WorkflowStepCard = styled.div`
  border: 1px solid #ff5757;
  padding: 15px;
  width: calc(33.333% - 20px);
  box-sizing: border-box;
  position: relative;
  background-color: #fff7eb;
  border-radius: 5px;
`;

const WorkflowStepTitle = styled.p`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
`;

const TaskCard = styled.div`
  border: 1px solid #ff5757;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff7eb;
  border-radius: 5px;
`;

const FilterSelect = styled.select`
  padding: 8px;
  margin-bottom: 10px;
  width: 200px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff7eb;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-height: 80%;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: #ff5757;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const Input = styled.input`
  padding: 8px;
  margin: 5px 0;
  width: 100%;
`;

const Select = styled.select`
  padding: 8px;
  margin: 5px 0;
  width: 100%;
`;

const Label = styled.label`
  font-weight: bold;
  margin-top: 10px;
  display: block;
`;

const ErrorMessage = styled.p`
  color: red;
`;

const ProjectDetails = () => {
  const { projectDetails, fetchProjectById, deleteProject } = useContext(ProjectContext);
  const { projectId } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepOrder, setNewStepOrder] = useState(1);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskRoleId, setNewTaskRoleId] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [bom, setBOM] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // New state variables for customer selection
  const [showSelectCustomerModal, setShowSelectCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const getProject = async () => {
      try {
        await fetchProjectById(projectId);
        await fetchWorkflow();
        await fetchRoles();
        await fetchInvoices();
      } catch (err) {
        setErrorMessage('Error fetching project details.');
        setShowErrorModal(true);
      }
    };
    getProject();
    // eslint-disable-next-line
  }, [projectId]);

  useEffect(() => {
    const fetchBOM = async () => {
      if (projectDetails?.reference?.bom) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/bom/${projectDetails.reference.bom}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setBOM(response.data.bom);
        } catch (err) {
          setBOM(null);
        }
      }
    };
    fetchBOM();
    // eslint-disable-next-line
  }, [projectDetails]);

  const handleBOMCreated = (newBOM) => {
    setBOM(newBOM);
  };

  const fetchWorkflow = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/workflows/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setWorkflow(response.data.workflow);
      setWorkflowSteps(response.data.workflow.workflowSteps);
    } catch (err) {
      setWorkflow(null);
      setErrorMessage('No workflow in this project');
      setShowErrorModal(true);
    }
  };

  const createWorkflow = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/workflows`,
        { projectId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      await fetchWorkflow();
    } catch (err) {
      setErrorMessage('Error creating workflow.');
      setShowErrorModal(true);
    }
  };

  const addWorkflowStep = async () => {
    if (!newStepName) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/workflow-steps`,
        {
          workflowId: workflow._id,
          name: newStepName,
          order: parseInt(newStepOrder),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setNewStepName('');
      setNewStepOrder(1);
      setShowAddStepModal(false);
      await fetchWorkflow();
    } catch (err) {
      setErrorMessage('Error adding workflow step.');
      setShowErrorModal(true);
    }
  };

  const deleteWorkflowStep = async (stepId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/workflow-steps/${stepId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      await fetchWorkflow();
      setSelectedStep(null);
      setTasks([]);
    } catch (err) {
      setErrorMessage('Error deleting workflow step.');
      setShowErrorModal(true);
    }
  };

  const fetchTasks = async (workflowStepId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/tasks/workflow-step/${workflowStepId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setTasks(response.data.tasks);
    } catch (err) {
      setTasks([]);
      setErrorMessage('Error fetching tasks.');
      setShowErrorModal(true);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/roles/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRoles(response.data.roles);
    } catch (err) {
      setRoles([]);
      setErrorMessage('Error fetching roles.');
      setShowErrorModal(true);
    }
  };

  const addTask = async () => {
    if (!newTaskDescription || !newTaskRoleId) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/tasks`,
        {
          description: newTaskDescription,
          workflowStepId: selectedStep._id,
          roleId: newTaskRoleId,
          dueDate: newTaskDueDate || null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setNewTaskDescription('');
      setNewTaskRoleId('');
      setNewTaskDueDate('');
      setShowAddTaskModal(false);
      await fetchTasks(selectedStep._id);
    } catch (err) {
      setErrorMessage('Error adding task.');
      setShowErrorModal(true);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      await fetchTasks(selectedStep._id);
    } catch (err) {
      setErrorMessage('Error deleting task.');
      setShowErrorModal(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      navigate('/projects');
    } catch (err) {
      setErrorMessage('Error deleting project.');
      setShowErrorModal(true);
    }
  };

  const handleViewStepDetails = async (step) => {
    setSelectedStep(step);
    await fetchTasks(step._id);
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/invoices?projectId=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setInvoices(response.data.invoices);
    } catch (err) {
      setErrorMessage('Error fetching invoices.');
      setShowErrorModal(true);
    }
  };

  // Fetch customers when opening the modal
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCustomers(response.data.customers);
    } catch (err) {
      setErrorMessage('Error fetching customers.');
      setShowErrorModal(true);
    }
  };

  const openSelectCustomerModal = async () => {
    await fetchCustomers();
    setShowSelectCustomerModal(true);
  };

  const handleCreateInvoice = () => {
    if (!selectedCustomerId) {
      setErrorMessage('Please select a customer.');
      setShowErrorModal(true);
      return;
    }
    createInvoice(selectedCustomerId);
    setShowSelectCustomerModal(false);
  };

  const createInvoice = async (customerId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/invoices`,
        {
          project: projectId,
          customer: customerId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Update invoices list
      setInvoices([...invoices, response.data.invoice]);
    } catch (err) {
      console.log(err);
      setErrorMessage('Error creating invoice.');
      setShowErrorModal(true);
    }
  };

  const downloadInvoice = async (invoiceId, filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/invoices/download/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setErrorMessage('Error downloading invoice.');
      setShowErrorModal(true);
    }
  };

  // New function to delete an invoice
  const deleteInvoice = async (invoiceId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Remove the deleted invoice from the state
      setInvoices(invoices.filter((invoice) => invoice._id !== invoiceId));
    } catch (err) {
      setErrorMessage('Error deleting invoice.');
      setShowErrorModal(true);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    selectedRoleFilter ? task.role && task.role._id === selectedRoleFilter : true
  );

  if (!projectDetails) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <Title>Project Details</Title>
      <Section>
        <h3>{projectDetails.title}</h3>
        <div>
          <Link to={`/projects/edit/${projectId}`}>
            <Button>Edit Project</Button>
          </Link>
          <Button onClick={handleDelete}>Delete Project</Button>
        </div>
      </Section>

      {/* Reference Section */}
      {projectDetails.reference && (
        <Section>
          <SubTitle>Reference Details</SubTitle>
          <p>
            <strong>Code:</strong> {projectDetails.reference.code}
          </p>
          <p>
            <strong>Description:</strong> {projectDetails.reference.description}
          </p>
          <div>
            {bom ? (
              <Button onClick={() => navigate(`/boms/${bom._id}`)}>View BOM</Button>
            ) : (
              <CreateBOMForm referenceId={projectDetails.reference._id} onBOMCreated={handleBOMCreated} />
            )}
          </div>
        </Section>
      )}

      {/* Invoices Section */}
      <Section>
        <SubTitle>Invoices</SubTitle>
        {invoices.length > 0 ? (
          <>
            <ul>
              {invoices.map((invoice) => (
                <li key={invoice._id}>
                  {invoice.filename}{' '}
                  <Button onClick={() => downloadInvoice(invoice._id, invoice.filename)}>
                    Download
                  </Button>
                  <Button onClick={() => deleteInvoice(invoice._id)}>Delete</Button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No invoices available.</p>
        )}
        {bom ? (
          <Button onClick={openSelectCustomerModal}>Create Invoice</Button>
        ) : (
          <p>You need to create a BOM before generating an invoice.</p>
        )}
      </Section>

      {/* Workflow Section */}
      <Section>
        <SubTitle>Workflow</SubTitle>
        {workflow ? (
          <>
            <div>
              <Button onClick={() => setShowAddStepModal(true)}>Add Workflow Step</Button>
            </div>
            <WorkflowContainer>
              {workflowSteps.map((step) => (
                <WorkflowStepCard key={step._id}>
                  <WorkflowStepTitle>
                    {step.order}. {step.name}
                  </WorkflowStepTitle>
                  <Button onClick={() => handleViewStepDetails(step)}>View Details</Button>
                  <Button onClick={() => deleteWorkflowStep(step._id)}>Delete Step</Button>
                </WorkflowStepCard>
              ))}
            </WorkflowContainer>
          </>
        ) : (
          <Button onClick={createWorkflow}>Create Workflow</Button>
        )}
      </Section>

      {/* Workflow Step Details */}
      {selectedStep && (
        <Section>
          <SubTitle>Workflow Step: {selectedStep.name}</SubTitle>
          <div>
            <FilterSelect
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </FilterSelect>
            <Button onClick={() => setShowAddTaskModal(true)}>Add Task</Button>
          </div>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard key={task._id}>
                <p>
                  <strong>{task.description}</strong>
                </p>
                <p>Assigned Role: {task.role ? task.role.name : 'Unassigned'}</p>
                <p>
                  Due Date:{' '}
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </p>
                <Button onClick={() => deleteTask(task._id)}>Delete Task</Button>
              </TaskCard>
            ))
          ) : (
            <p>No tasks available.</p>
          )}
        </Section>
      )}

      {/* Add Workflow Step Modal */}
      {showAddStepModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowAddStepModal(false)}>&times;</CloseButton>
            <h3>Add Workflow Step</h3>
            <div>
              <Label>Step Name:</Label>
              <Input
                type="text"
                placeholder="Step Name"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
              />
            </div>
            <div>
              <Label>Order:</Label>
              <Input
                type="number"
                placeholder="Order"
                value={newStepOrder}
                onChange={(e) => setNewStepOrder(e.target.value)}
              />
            </div>
            <Button onClick={addWorkflowStep}>Add Step</Button>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowAddTaskModal(false)}>&times;</CloseButton>
            <h3>Add Task to {selectedStep.name}</h3>
            <div>
              <Label>Task Description:</Label>
              <Input
                type="text"
                placeholder="Task Description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Assigned Role:</Label>
              <Select
                value={newTaskRoleId}
                onChange={(e) => setNewTaskRoleId(e.target.value)}
              >
                <option value="">Select Assigned Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Due Date:</Label>
              <Input
                type="date"
                placeholder="Due Date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
              />
            </div>
            <Button onClick={addTask}>Add Task</Button>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Select Customer Modal */}
      {showSelectCustomerModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowSelectCustomerModal(false)}>&times;</CloseButton>
            <h3>Select Customer</h3>
            <div>
              <Label>Customer:</Label>
              <Select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={handleCreateInvoice}>Create Invoice</Button>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage('');
              }}
            >
              &times;
            </CloseButton>
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <Button
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage('');
              }}
            >
              Close
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ProjectDetails;
