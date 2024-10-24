// src/pages/SupplierDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

// Styled Components
const Container = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #e30202;
  text-align: center;
  margin-bottom: 40px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  margin-bottom: 10px;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  top: 12px;
  left: 12px;
  color: #aaa;
`;

const SearchBar = styled.input`
  padding: 10px 10px 10px 40px;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 50px;
  outline: none;
  transition: border 0.3s;

  &:focus {
    border-color: #ff5757;
  }
`;

const AddButton = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 12px 20px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-bottom: 10px;

  &:hover {
    background-color: #e04e4e;
  }
`;

const PlusIcon = styled(AiOutlinePlus)`
  margin-right: 8px;
  font-size: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #fff7eb;
  border-radius: 10px;
  overflow: hidden;
`;

const Thead = styled.thead`
  background-color: #ff5757;
  color: white;
`;

const Th = styled.th`
  padding: 15px;
  text-align: left;
  font-size: 16px;
`;

const Tbody = styled.tbody`
  color: #333;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #ddd;

  &:nth-child(even) {
    background-color: #ffecec;
  }

  &:hover {
    background-color: #ffdada;
  }
`;

const Td = styled.td`
  padding: 15px;
  vertical-align: middle;
  font-size: 15px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const IconButton = styled.button`
  background-color: transparent;
  color: #ff5757;
  border: none;
  cursor: pointer;
  font-size: 20px;
  transition: color 0.3s;

  &:hover {
    color: #e04e4e;
  }
`;

const NoData = styled.p`
  text-align: center;
  color: #888;
  padding: 20px;
  font-size: 16px;
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
  padding: 30px;
  border-radius: 10px;
  width: 500px;
  position: relative;
`;

const ModalTitle = styled.h3`
  margin-bottom: 20px;
  color: #e30202;
`;

const Label = styled.label`
  font-weight: bold;
  margin-top: 10px;
  display: block;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  margin: 5px 0 15px 0;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  transition: border 0.3s;

  &:focus {
    border-color: #ff5757;
  }
`;

const SaveButton = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 12px 20px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  width: 100%;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e04e4e;
  }
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: #ff5757;
  border: none;
  font-size: 28px;
  position: absolute;
  top: 10px;
  right: 15px;
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
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredSuppliers(
      suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(term)
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
    if (window.confirm('Are you sure you want to delete this supplier?')) {
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
    }
  };

  return (
    <Container>
      <Title>Suppliers Dashboard</Title>
      <ActionBar>
        <SearchContainer>
          <SearchIcon />
          <SearchBar
            type="text"
            placeholder="Search suppliers by name"
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
        <AddButton onClick={() => handleModal(false)}>
          <PlusIcon /> Add Supplier
        </AddButton>
      </ActionBar>
      <Table>
        <Thead>
          <tr>
            <Th>Name</Th>
            <Th>Contact Info</Th>
            <Th>Actions</Th>
          </tr>
        </Thead>
        <Tbody>
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier) => (
              <Tr key={supplier._id}>
                <Td>{supplier.name}</Td>
                <Td>{supplier.contactInfo}</Td>
                <Td>
                  <ActionButtons>
                    <IconButton onClick={() => handleModal(true, supplier)}>
                      <AiOutlineEdit />
                    </IconButton>
                    <IconButton onClick={() => deleteSupplier(supplier._id)}>
                      <AiOutlineDelete />
                    </IconButton>
                  </ActionButtons>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan="3">
                <NoData>No suppliers found</NoData>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      {/* Add/Edit Supplier Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <ModalTitle>{isEditMode ? 'Edit Supplier' : 'Add Supplier'}</ModalTitle>
            <div>
              <Label>Name:</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Contact Info:</Label>
              <Input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
              />
            </div>
            <SaveButton onClick={isEditMode ? updateSupplier : addSupplier}>
              {isEditMode ? 'Update Supplier' : 'Add Supplier'}
            </SaveButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default SupplierDashboard;
