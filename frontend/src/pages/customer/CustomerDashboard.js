import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #ff5757;
  color: white;
  padding: 10px;
  text-align: left;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
`;

const SearchBar = styled.input`
  padding: 10px;
  width: 300px;
  margin-bottom: 20px;
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
`;

const Input = styled.input`
  padding: 8px;
  margin: 10px 0;
  width: 100%;
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

// Customer Dashboard Component
const CustomerDashboard = () => {
  const navigate = useNavigate(); 
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: "", contactInfo: "" });

  const API_BASE_URL = "http://localhost:5000"; // Adjust as necessary

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch customers from the server
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCustomers(response.data.customers);
      setFilteredCustomers(response.data.customers);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  // Filter customers based on search term
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    setFilteredCustomers(
      customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm)
      )
    );
  };

  // Handle Add/Edit Customer Modal
  const handleModal = (isEdit = false, customer = null) => {
    setIsEditMode(isEdit);
    if (isEdit && customer) {
      setCurrentCustomer(customer);
      setFormData({ name: customer.name, contactInfo: customer.contactInfo });
    } else {
      setFormData({ name: "", contactInfo: "" });
    }
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentCustomer(null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new customer
  const addCustomer = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/customers`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchCustomers();
      closeModal();
    } catch (err) {
      console.error("Error adding customer:", err);
    }
  };

  // Update an existing customer
  const updateCustomer = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/customers/${currentCustomer._id}`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchCustomers();
      closeModal();
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  };

  // Delete a customer
  const deleteCustomer = async (customerId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  return (
    <Container>
      <h1>Customers Dashboard</h1>
      <Button onClick={() => handleModal(false)}>Add Customer</Button>
      <SearchBar
        type="text"
        placeholder="Search customers by name"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Contact Info</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <tr key={customer._id}>
                <Td>{customer.name}</Td>
                <Td>{customer.contactInfo}</Td>
                <Td>
                  <Button onClick={() => handleModal(true, customer)}>
                    Edit
                  </Button>
                  <Button onClick={() => deleteCustomer(customer._id)}>
                    Delete
                  </Button>
                  <Button
                    onClick={() => navigate(`/customers/${customer._id}`)}
                  >
                    {" "}
                    {/* Redirect to Customer Details */}
                    View
                  </Button>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan="3">No customers found</Td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit Customer Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <h3>{isEditMode ? "Edit Customer" : "Add Customer"}</h3>
            <div>
              <label>Name:</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Contact Info:</label>
              <Input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
              />
            </div>
            <Button onClick={isEditMode ? updateCustomer : addCustomer}>
              {isEditMode ? "Update Customer" : "Add Customer"}
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default CustomerDashboard;
