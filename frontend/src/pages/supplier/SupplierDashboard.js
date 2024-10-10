import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

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

// Supplier Dashboard Component
const SupplierDashboard = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formData, setFormData] = useState({ name: '', contactInfo: '' });

  const API_BASE_URL = 'http://localhost:5000'; // Adjust as necessary

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fetch suppliers from the server
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/suppliers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuppliers(response.data.suppliers);
      setFilteredSuppliers(response.data.suppliers);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  // Filter suppliers based on search term
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    setFilteredSuppliers(
      suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchTerm)
      )
    );
  };

  // Handle Add/Edit Supplier Modal
  const handleModal = (isEdit = false, supplier = null) => {
    setIsEditMode(isEdit);
    if (isEdit && supplier) {
      setCurrentSupplier(supplier);
      setFormData({ name: supplier.name, contactInfo: supplier.contactInfo });
    } else {
      setFormData({ name: '', contactInfo: '' });
    }
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentSupplier(null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new supplier
  const addSupplier = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/suppliers`,
        { name: formData.name, contactInfo: formData.contactInfo },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchSuppliers();
      closeModal();
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  // Update an existing supplier
  const updateSupplier = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/suppliers/${currentSupplier._id}`,
        { name: formData.name, contactInfo: formData.contactInfo },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchSuppliers();
      closeModal();
    } catch (err) {
      console.error('Error updating supplier:', err);
    }
  };

  // Delete a supplier
  const deleteSupplier = async (supplierId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/suppliers/${supplierId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  return (
    <Container>
      <h1>Suppliers Dashboard</h1>
      <Button onClick={() => handleModal(false)}>Add Supplier</Button>
      <SearchBar
        type="text"
        placeholder="Search suppliers by name"
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
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier) => (
              <tr key={supplier._id}>
                <Td>{supplier.name}</Td>
                <Td>{supplier.contactInfo}</Td>
                <Td>
                  <Button onClick={() => handleModal(true, supplier)}>
                    Edit
                  </Button>
                  <Button onClick={() => deleteSupplier(supplier._id)}>
                    Delete
                  </Button>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan="3">No suppliers found</Td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit Supplier Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <h3>{isEditMode ? 'Edit Supplier' : 'Add Supplier'}</h3>
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
            <Button onClick={isEditMode ? updateSupplier : addSupplier}>
              {isEditMode ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default SupplierDashboard;
