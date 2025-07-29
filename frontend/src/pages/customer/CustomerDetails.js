import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: #f0f4ff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background-color: #4267B2;
  color: white;
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  background-color: ${(props) => (props.index % 2 === 0 ? '#f9f9f9' : '#fff')};
`;

const SubTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
`;

const SubTh = styled.th`
  background-color: #5b80d6;
  color: white;
  padding: 8px;
  text-align: left;
`;

const SubTd = styled.td`
  padding: 8px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  background-color: #4267B2;
  color: #fff7eb;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;

  &:hover {
    background-color: #3758a5;
  }
`;

const CollapseButton = styled(Button)`
  background-color: #5b80d6;

  &:hover {
    background-color: #4a6cc1;
  }
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
  background-color: #f0f4ff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  position: relative;
`;

const Input = styled.input`
  padding: 8px;
  margin: 10px 0;
  width: 100%;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: #4267B2;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;

  &:hover {
    color: #3758a5;
  }
`;

const SectionTitle = styled.h3`
  margin: 15px 0;
  border-bottom: 2px solid #4267B2;
  padding-bottom: 5px;
`;


const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  // State variables for Customer Needs
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentNeed, setCurrentNeed] = useState(null);
  const [needFormData, setNeedFormData] = useState({ description: '' });

  // State variables for Requirements
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [isRequirementEditMode, setIsRequirementEditMode] = useState(false);
  const [currentRequirement, setCurrentRequirement] = useState(null);
  const [requirementFormData, setRequirementFormData] = useState({ description: '' });
  const [currentCustomerNeedId, setCurrentCustomerNeedId] = useState(null);

  // State for collapsing needs
  const [collapsedNeeds, setCollapsedNeeds] = useState({});

  // API Base URL
  const API_BASE_URL = 'http://localhost:5005';

  useEffect(() => {
    fetchCustomerDetails();
  }, []);

  // Fetch customer details by ID
  const fetchCustomerDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCustomer(response.data.customer);
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  // Create an invoice for the customer
  const createInvoice = async () => {
    try {
      console.log("hello")
      const response = await axios.post(
        `${API_BASE_URL}/api/invoices`,
        {
          customer: customer._id,
          project: customer.project._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log(response)
      // Update the customer's invoices list
      setCustomer({
        ...customer,
        invoices: [...customer.invoices, response.data.invoice],
      });
    } catch (err) {
      console.error('Error creating invoice:', err);
    }
  };

  // Download an invoice
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
      console.error('Error downloading invoice:', err);
    }
  };

  // Customer Need Modal Handlers
  const handleNeedModal = (isEdit = false, need = null) => {
    setIsEditMode(isEdit);
    if (isEdit && need) {
      setCurrentNeed(need);
      setNeedFormData({ description: need.description });
    } else {
      setNeedFormData({ description: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentNeed(null);
  };

  const handleChange = (e) => {
    setNeedFormData({ ...needFormData, [e.target.name]: e.target.value });
  };

  const saveCustomerNeed = async () => {
    try {
      if (isEditMode) {
        await axios.put(
          `${API_BASE_URL}/api/customer-needs/${currentNeed._id}`,
          { ...needFormData, customer: customer._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/customer-needs`,
          { ...needFormData, customer: customer._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      fetchCustomerDetails();
      closeModal();
    } catch (err) {
      console.error('Error saving customer need:', err);
    }
  };

  const deleteCustomerNeed = async (needId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/customer-needs/${needId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchCustomerDetails();
    } catch (err) {
      console.error('Error deleting customer need:', err);
    }
  };

  // Requirement Modal Handlers
  const handleRequirementModal = (isEdit = false, requirement = null, customerNeedId = null) => {
    setIsRequirementEditMode(isEdit);
    if (isEdit && requirement) {
      setCurrentRequirement(requirement);
      setRequirementFormData({ description: requirement.description });
      setCurrentCustomerNeedId(customerNeedId);
    } else {
      setRequirementFormData({ description: '' });
      setCurrentRequirement(null);
      setCurrentCustomerNeedId(customerNeedId);
    }
    setShowRequirementModal(true);
  };

  const closeRequirementModal = () => {
    setShowRequirementModal(false);
    setCurrentRequirement(null);
    setCurrentCustomerNeedId(null);
  };

  const handleRequirementChange = (e) => {
    setRequirementFormData({ ...requirementFormData, [e.target.name]: e.target.value });
  };

  const saveRequirement = async () => {
    try {
      if (isRequirementEditMode) {
        await axios.put(
          `${API_BASE_URL}/api/requirements/${currentRequirement._id}`,
          { ...requirementFormData },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/requirements`,
          { ...requirementFormData, customerNeed: currentCustomerNeedId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
      fetchCustomerDetails();
      closeRequirementModal();
    } catch (err) {
      console.error('Error saving requirement:', err);
    }
  };

  const deleteRequirement = async (requirementId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/requirements/${requirementId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchCustomerDetails();
    } catch (err) {
      console.error('Error deleting requirement:', err);
    }
  };

  // Toggle collapse for customer needs
  const toggleCollapse = (needId) => {
    setCollapsedNeeds((prevState) => ({
      ...prevState,
      [needId]: !prevState[needId],
    }));
  };

  return (
    <Container>
      <h1>Customer Details</h1>
      {customer && (
        <>
          <h2>{customer.name}</h2>
          <p>Contact Info: {customer.contactInfo}</p>

          <SectionTitle>Customer Needs</SectionTitle>
          <Button onClick={() => handleNeedModal(false)}>Add Customer Need</Button>
          <Table>
            <thead>
              <tr>
                <Th>Description</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {customer.customerNeeds?.length > 0 ? (
                customer.customerNeeds.map((need, index) => (
                  <React.Fragment key={need._id}>
                    <tr>
                      <Td index={index}>{need.description}</Td>
                      <Td index={index}>
                        <Button onClick={() => handleNeedModal(true, need)}>Edit</Button>
                        <Button onClick={() => deleteCustomerNeed(need._id)}>Delete</Button>
                        <CollapseButton onClick={() => toggleCollapse(need._id)}>
                          {collapsedNeeds[need._id] ? 'Show Requirements' : 'Hide Requirements'}
                        </CollapseButton>
                      </Td>
                    </tr>
                    {!collapsedNeeds[need._id] && (
                      <tr>
                        <Td colSpan="2">
                          <h4>Requirements</h4>
                          <Button onClick={() => handleRequirementModal(false, null, need._id)}>
                            Add Requirement
                          </Button>
                          <SubTable>
                            <thead>
                              <tr>
                                <SubTh>Requirement</SubTh>
                                <SubTh>Actions</SubTh>
                              </tr>
                            </thead>
                            <tbody>
                              {need.requirements?.length > 0 ? (
                                need.requirements.map((requirement) => (
                                  <tr key={requirement._id}>
                                    <SubTd>{requirement.description}</SubTd>
                                    <SubTd>
                                      <Button
                                        onClick={() =>
                                          handleRequirementModal(true, requirement, need._id)
                                        }
                                      >
                                        Edit
                                      </Button>
                                      <Button onClick={() => deleteRequirement(requirement._id)}>
                                        Delete
                                      </Button>
                                    </SubTd>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <SubTd colSpan="2">No requirements found</SubTd>
                                </tr>
                              )}
                            </tbody>
                          </SubTable>
                        </Td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <Td colSpan="2">No customer needs found</Td>
                </tr>
              )}
            </tbody>
          </Table>

          <SectionTitle>Invoices</SectionTitle>
          {/* <Button onClick={createInvoice}>Create Invoice</Button> */}
          <Table>
            <thead>
              <tr>
                <Th>Filename</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {customer.invoices?.length > 0 ? (
                customer.invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <Td>{invoice.filename}</Td>
                    <Td>
                      <Button onClick={() => downloadInvoice(invoice._id, `Invoice_${invoice._id}.pdf`)}>
                        Download
                      </Button>
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <Td colSpan="2">No invoices found</Td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}

      {/* Customer Need Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <h2>{isEditMode ? 'Edit Customer Need' : 'Add Customer Need'}</h2>
            <Input
              type="text"
              name="description"
              value={needFormData.description}
              onChange={handleChange}
              placeholder="Need Description"
            />
            <Button onClick={saveCustomerNeed}>{isEditMode ? 'Update' : 'Add'}</Button>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Requirement Modal */}
      {showRequirementModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeRequirementModal}>&times;</CloseButton>
            <h2>{isRequirementEditMode ? 'Edit Requirement' : 'Add Requirement'}</h2>
            <Input
              type="text"
              name="description"
              value={requirementFormData.description}
              onChange={handleRequirementChange}
              placeholder="Requirement Description"
            />
            <Button onClick={saveRequirement}>{isRequirementEditMode ? 'Update' : 'Add'}</Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default CustomerDetails;
