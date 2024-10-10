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

const Select = styled.select`
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

  const API_BASE_URL = 'http://localhost:5000'; // Adjust as necessary

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
    setFilteredResources(
      resources.filter((resource) =>
        resource.name.toLowerCase().includes(term) &&
        (!selectedSupplierFilter || resource.supplier._id === selectedSupplierFilter)
      )
    );
  };

  // Filter resources by supplier
  const handleSupplierFilter = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierFilter(supplierId);
    setFilteredResources(
      resources.filter(
        (resource) =>
          (!searchTerm || resource.name.toLowerCase().includes(searchTerm)) &&
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
  };

  return (
    <Container>
      <h1>Resources Dashboard</h1>
      <Button onClick={() => handleModal(false)}>Add Resource</Button>
      <SearchBar
        type="text"
        placeholder="Search resources by name"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Select value={selectedSupplierFilter} onChange={handleSupplierFilter}>
        <option value="">All Suppliers</option>
        {suppliers.map((supplier) => (
          <option key={supplier._id} value={supplier._id}>
            {supplier.name}
          </option>
        ))}
      </Select>
      <Table>
        <thead>
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
        </thead>
        <tbody>
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <tr key={resource._id}>
                <Td>{resource.name}</Td>
                <Td>{resource.type}</Td>
                <Td>{resource.description}</Td>
                <Td>{resource.unitCost}</Td>
                <Td>{resource.unitTime}</Td>
                <Td>{resource.unit}</Td>
                <Td>{resource.supplier.name}</Td>
                <Td>
                  <Button onClick={() => handleModal(true, resource)}>Edit</Button>
                  <Button onClick={() => deleteResource(resource._id)}>Delete</Button>
                </Td>
              </tr>
            ))
          ) : (
            <tr>
              <Td colSpan="8">No resources found</Td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit Resource Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <h3>{isEditMode ? 'Edit Resource' : 'Add Resource'}</h3>
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
              <label>Type:</label>
              <Input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Description:</label>
              <Input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Unit Cost:</label>
              <Input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Unit Time:</label>
              <Input
                type="number"
                name="unitTime"
                value={formData.unitTime}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Unit:</label>
              <Input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Supplier:</label>
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
            <Button onClick={isEditMode ? updateResource : addResource}>
              {isEditMode ? 'Update Resource' : 'Add Resource'}
            </Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ResourceDashboard;
