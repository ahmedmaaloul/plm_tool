import React, { useEffect, useContext, useState } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import CreateBOMForm from '../../components/bom/CreateBOMForm';
import { 
  FaEdit, 
  FaTrash, 
  FaFileDownload, 
  FaPlus, 
  FaTimes, 
  FaFileInvoice, 
  FaUsers, 
  FaClipboardList, 
  FaProjectDiagram 
} from "react-icons/fa";

const Container = styled.div`
  padding: 40px 2vw;
  background: linear-gradient(120deg, #f0f4ff 60%, #e9efff 100%);
  min-height: calc(100vh - 60px);
`;

const Section = styled.section`
  background: rgba(255,255,255,0.92);
  border-radius: 18px;
  box-shadow: 0 2px 16px #4267b216;
  padding: 28px 24px;
  margin-bottom: 32px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
`;

const Title = styled.h2`
  color: #4267B2;
  font-weight: 800;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 24px;
  letter-spacing: 1px;
`;

const SubTitle = styled.h3`
  color: #3758a5;
  font-size: 1.19rem;
  margin-bottom: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #4267B2;
  color: #fff;
  padding: 9px 20px;
  border: none;
  border-radius: 22px;
  font-weight: 600;
  font-size: 1rem;
  margin: 5px 0;
  box-shadow: 0 2px 8px #4267b21a;
  cursor: pointer;
  transition: background 0.18s, transform 0.14s;

  &:hover {
    background: #3758a5;
    transform: scale(1.04);
  }
`;

const WorkflowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 18px;
  margin-top: 20px;
`;

const WorkflowStepCard = styled.div`
  background: #f5f9ffbb;
  border: 1.5px solid #4267B2;
  border-radius: 14px;
  padding: 20px 16px;
  box-shadow: 0 4px 12px #4267b212;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: transform 0.13s;
  &:hover {
    transform: translateY(-2px) scale(1.018);
    border: 1.5px solid #3758a5;
  }
`;

const WorkflowStepTitle = styled.p`
  font-weight: bold;
  font-size: 1.11rem;
  margin-bottom: 12px;
  color: #4267B2;
`;

const TaskCard = styled.div`
  background: #f6f9fd;
  border: 1.5px solid #e6eafd;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 10px #4267b20a;
  transition: box-shadow 0.13s;
  &:hover {
    box-shadow: 0 4px 20px #4267b215;
  }
`;

const FilterSelect = styled.select`
  padding: 9px;
  border-radius: 7px;
  background: #f0f4ff;
  color: #3758a5;
  border: 1px solid #b5c9e5;
  margin-bottom: 0;
  margin-right: 10px;
  min-width: 140px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(45, 61, 101, 0.24);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 28px #4267b22f;
  padding: 38px 28px 30px 28px;
  width: 98vw;
  max-width: 420px;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  animation: appear .23s cubic-bezier(.19,1,.22,1);

  @keyframes appear {
    0% { opacity: 0; transform: scale(.97);}
    100% { opacity: 1; transform: none;}
  }
`;

const CloseButton = styled.button`
  background: transparent;
  color: #4267B2;
  border: none;
  font-size: 2rem;
  position: absolute;
  top: 15px;
  right: 22px;
  cursor: pointer;
  transition: color 0.16s;

  &:hover {
    color: #d53b2d;
  }
`;

const Input = styled.input`
  padding: 9px;
  margin: 5px 0 16px 0;
  width: 100%;
  border: 1.2px solid #b5c9e5;
  border-radius: 7px;
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 9px;
  margin: 5px 0 16px 0;
  width: 100%;
  border: 1.2px solid #b5c9e5;
  border-radius: 7px;
  font-size: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #4267B2;
  margin-top: 6px;
  display: block;
  margin-bottom: 5px;
`;

const ErrorMessage = styled.p`
  color: #d53b2d;
  font-weight: 500;
  background: #fff4f4;
  border-radius: 6px;
  padding: 7px 15px;
`;

const InvoiceList = styled.ul`
  padding-left: 0;
  margin: 0;
  list-style: none;
`;

const InvoiceItem = styled.li`
  background: #f5f9ff;
  border: 1.2px solid #c0d6ff;
  border-radius: 10px;
  padding: 12px 12px 8px 18px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #3758a5;
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

  const API_BASE_URL = 'http://localhost:5005';

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
        <SubTitle>
          <FaProjectDiagram style={{color:"#4267B2"}} /> {projectDetails.title}
        </SubTitle>
        <ActionGroup>
          <Link to={`/projects/edit/${projectId}`}>
            <Button><FaEdit /> Edit</Button>
          </Link>
          <Button onClick={handleDelete}><FaTrash /> Delete</Button>
        </ActionGroup>
      </Section>

      {projectDetails.reference && (
        <Section>
          <SubTitle>
            <FaClipboardList style={{color:"#4267B2"}} /> Reference Details
          </SubTitle>
          <p>
            <strong>Code:</strong> {projectDetails.reference.code}
          </p>
          <p>
            <strong>Description:</strong> {projectDetails.reference.description}
          </p>
          <div style={{marginTop: 10}}>
            {bom ? (
              <Button onClick={() => navigate(`/boms/${bom._id}`)}>View BOM</Button>
            ) : (
              <CreateBOMForm referenceId={projectDetails.reference._id} onBOMCreated={handleBOMCreated} />
            )}
          </div>
        </Section>
      )}

      <Section>
        <SubTitle>
          <FaFileInvoice style={{color:"#4267B2"}} /> Invoices
        </SubTitle>
        {invoices.length > 0 ? (
          <InvoiceList>
            {invoices.map((invoice) => (
              <InvoiceItem key={invoice._id}>
                {invoice.filename}
                <ActionGroup>
                  <Button onClick={() => downloadInvoice(invoice._id, invoice.filename)}>
                    <FaFileDownload /> Download
                  </Button>
                  <Button onClick={() => deleteInvoice(invoice._id)}>
                    <FaTrash /> Delete
                  </Button>
                </ActionGroup>
              </InvoiceItem>
            ))}
          </InvoiceList>
        ) : (
          <p>No invoices available.</p>
        )}
        {bom ? (
          <Button onClick={openSelectCustomerModal}><FaPlus /> Create Invoice</Button>
        ) : (
          <p style={{color:"#888"}}>You need to create a BOM before generating an invoice.</p>
        )}
      </Section>

      <Section>
        <SubTitle>
          <FaUsers style={{color:"#4267B2"}} /> Workflow
        </SubTitle>
        {workflow ? (
          <>
            <Button onClick={() => setShowAddStepModal(true)}>
              <FaPlus /> Add Workflow Step
            </Button>
            <WorkflowContainer>
              {workflowSteps.map((step) => (
                <WorkflowStepCard key={step._id}>
                  <WorkflowStepTitle>
                    {step.order}. {step.name}
                  </WorkflowStepTitle>
                  <ActionGroup>
                    <Button onClick={() => handleViewStepDetails(step)}>Details</Button>
                    <Button onClick={() => deleteWorkflowStep(step._id)}><FaTrash /> Delete</Button>
                  </ActionGroup>
                </WorkflowStepCard>
              ))}
            </WorkflowContainer>
          </>
        ) : (
          <Button onClick={createWorkflow}><FaPlus /> Create Workflow</Button>
        )}
      </Section>

      {selectedStep && (
        <Section>
          <SubTitle>
            <FaClipboardList style={{color:"#4267B2"}} /> Workflow Step: {selectedStep.name}
          </SubTitle>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14}}>
            <FilterSelect
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </FilterSelect>
            <Button onClick={() => setShowAddTaskModal(true)}>
              <FaPlus /> Add Task
            </Button>
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
                <Button onClick={() => deleteTask(task._id)}>
                  <FaTrash /> Delete
                </Button>
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
            <CloseButton onClick={() => setShowAddStepModal(false)}>
              <FaTimes />
            </CloseButton>
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
            <Button onClick={addWorkflowStep}>
              <FaPlus /> Add Step
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowAddTaskModal(false)}>
              <FaTimes />
            </CloseButton>
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
                  <option key={role._id} value={role._id}>{role.name}</option>
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
            <Button onClick={addTask}>
              <FaPlus /> Add Task
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Select Customer Modal */}
      {showSelectCustomerModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowSelectCustomerModal(false)}>
              <FaTimes />
            </CloseButton>
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
            <Button onClick={handleCreateInvoice}>
              <FaPlus /> Create Invoice
            </Button>
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
              }}>
              <FaTimes />
            </CloseButton>
            <h3>Error</h3>
            <ErrorMessage>{errorMessage}</ErrorMessage>
            <Button
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage('');
              }}>
              Close
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ProjectDetails;
