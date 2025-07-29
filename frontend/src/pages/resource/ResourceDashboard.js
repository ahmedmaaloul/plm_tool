// src/pages/ResourceDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { FaFilter } from 'react-icons/fa';
// Styled Components
const Container = styled.div`
  padding: 40px 20px;
  max-width: 1300px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #4267B2;
  text-align: center;
  margin-bottom: 40px;
`;

const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
    border-color: #4267B2;
  }
`;

const FilterContainer = styled.div`
  position: relative;
  width: 200px;
  margin-bottom: 10px;
`;

const FilterIcon = styled(FaFilter)`
  position: absolute;
  top: 12px;
  left: 12px;
  color: #aaa;
`;

const FilterSelect = styled.select`
  padding: 10px 10px 10px 40px;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 50px;
  outline: none;
  appearance: none;
  background-color: transparent;
  transition: border 0.3s;

  &:focus {
    border-color: #4267B2;
  }
`;

const AddButton = styled.button`
  background-color: #4267B2;
  color: #f0f4ff;
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
    background-color: #3758a5;
  }
`;

const PlusIcon = styled(AiOutlinePlus)`
  margin-right: 8px;
  font-size: 20px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #f0f4ff;
  border-radius: 10px;
  overflow: hidden;
`;

const Thead = styled.thead`
  background-color: #4267B2;
  color: white;
`;

const Th = styled.th`
  padding: 15px;
  text-align: left;
  font-size: 16px;
  white-space: nowrap;
`;

const Tbody = styled.tbody`
  color: #333;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #ddd;

  &:nth-child(even) {
    background-color: #e5ecfb;
  }

  &:hover {
    background-color: #d0dbf7;
  }
`;

const Td = styled.td`
  padding: 15px;
  vertical-align: middle;
  font-size: 15px;
  white-space: nowrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const IconButton = styled.button`
  background-color: transparent;
  color: #4267B2;
  border: none;
  cursor: pointer;
  font-size: 20px;
  transition: color 0.3s;

  &:hover {
    color: #3758a5;
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
  background-color: #f0f4ff;
  padding: 30px;
  border-radius: 10px;
  width: 500px;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin-bottom: 20px;
  color: #4267B2;
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
    border-color: #4267B2;
  }
`;

const Select = styled.select`
  padding: 10px;
  margin: 5px 0 15px 0;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  appearance: none;
  background-color: transparent;
  transition: border 0.3s;

  &:focus {
    border-color: #4267B2;
  }
`;

const SaveButton = styled.button`
  background-color: #4267B2;
  color: #f0f4ff;
  padding: 12px 20px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  width: 100%;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3758a5;
  }
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: #4267B2;
  border: none;
  font-size: 28px;
  position: absolute;
  top: 10px;
  right: 15px;
  cursor: pointer;

  &:hover {
    color: #3758a5;
  }
`;


// Resource Dashboard Component
const ResourceDashboard = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    unitCost: '',
    unitTime: '',
    unit: '',
    supplierId: '',
  });

  const API_BASE_URL = 'http://localhost:5005';

  useEffect(() => {
    fetchResources();
    fetchSuppliers();
  }, []);

  // Fetch resources from the server
  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/resources`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setResources(response.data.resources);
      setFilteredResources(response.data.resources);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  // Fetch suppliers from the server
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/suppliers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuppliers(response.data.suppliers);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  // Filter resources based on search term and supplier
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterResources(term, selectedSupplierFilter);
  };

  // Filter resources by supplier
  const handleSupplierFilter = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierFilter(supplierId);
    filterResources(searchTerm, supplierId);
  };

  // Helper function to filter resources
  const filterResources = (term, supplierId) => {
    setFilteredResources(
      resources.filter(
        (resource) =>
          resource.name.toLowerCase().includes(term) &&
          (!supplierId || resource.supplier._id === supplierId)
      )
    );
  };

  // Handle Add/Edit Resource Modal
  const handleModal = (isEdit = false, resource = null) => {
    setIsEditMode(isEdit);
    if (isEdit && resource) {
      setCurrentResource(resource);
      setFormData({
        name: resource.name,
        type: resource.type,
        description: resource.description,
        unitCost: resource.unitCost,
        unitTime: resource.unitTime,
        unit: resource.unit,
        supplierId: resource.supplier._id,
      });
    } else {
      setFormData({
        name: '',
        type: '',
        description: '',
        unitCost: '',
        unitTime: '',
        unit: '',
        supplierId: '',
      });
    }
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentResource(null);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new resource
  const addResource = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/resources`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchResources();
      closeModal();
    } catch (err) {
      console.error('Error adding resource:', err);
    }
  };

  // Update an existing resource
  const updateResource = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/resources/${currentResource._id}`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchResources();
      closeModal();
    } catch (err) {
      console.error('Error updating resource:', err);
    }
  };

  // Delete a resource
  const deleteResource = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/resources/${resourceId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchResources();
      } catch (err) {
        console.error('Error deleting resource:', err);
      }
    }
  };

  return (
    <Container>
      <Title>Resources Dashboard</Title>
      <ActionBar>
        <SearchContainer>
          <SearchIcon />
          <SearchBar
            type="text"
            placeholder="Search resources by name"
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
        <FilterContainer>
          <FilterIcon />
          <FilterSelect value={selectedSupplierFilter} onChange={handleSupplierFilter}>
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </FilterSelect>
        </FilterContainer>
        <AddButton onClick={() => handleModal(false)}>
          <PlusIcon /> Add Resource
        </AddButton>
      </ActionBar>
      <TableContainer>
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Description</Th>
              <Th>Unit Cost</Th>
              <Th>Unit Time</Th>
              <Th>Unit</Th>
              <Th>Supplier</Th>
              <Th>Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <Tr key={resource._id}>
                  <Td>{resource.name}</Td>
                  <Td>{resource.type}</Td>
                  <Td>{resource.description}</Td>
                  <Td>{resource.unitCost}</Td>
                  <Td>{resource.unitTime}</Td>
                  <Td>{resource.unit}</Td>
                  <Td>{resource.supplier.name}</Td>
                  <Td>
                    <ActionButtons>
                      <IconButton onClick={() => handleModal(true, resource)}>
                        <AiOutlineEdit />
                      </IconButton>
                      <IconButton onClick={() => deleteResource(resource._id)}>
                        <AiOutlineDelete />
                      </IconButton>
                    </ActionButtons>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan="8">
                  <NoData>No resources found</NoData>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Add/Edit Resource Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <ModalTitle>{isEditMode ? 'Edit Resource' : 'Add Resource'}</ModalTitle>
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
              <Label>Type:</Label>
              <Input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Description:</Label>
              <Input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Unit Cost:</Label>
              <Input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Unit Time:</Label>
              <Input
                type="number"
                name="unitTime"
                value={formData.unitTime}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Unit:</Label>
              <Input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Supplier:</Label>
              <Select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </div>
            <SaveButton onClick={isEditMode ? updateResource : addResource}>
              {isEditMode ? 'Update Resource' : 'Add Resource'}
            </SaveButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ResourceDashboard;
