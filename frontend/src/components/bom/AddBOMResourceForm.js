// src/components/AddBOMResourceForm.jsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const FormContainer = styled.div`
  margin-top: 20px;
`;

const Select = styled.select`
  padding: 8px;
  margin: 5px 0;
  width: 100%;
`;

const Input = styled.input`
  padding: 8px;
  margin: 5px 0;
  width: 100%;
`;

const Button = styled.button`
  background-color: #4267B2;
  color: #fff7eb;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #3758a5;
  }
`;

const Label = styled.label`
  font-weight: bold;
  margin-top: 10px;
  display: block;
`;

const ErrorMessage = styled.p`
  color: red;
`;


const AddBOMResourceForm = ({ bomId, onResourceAdded }) => {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5005';

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/resources`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setResources(response.data.resources);
      } catch (err) {
        setError('Error fetching resources.');
      }
    };
    fetchResources();
  }, []);

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!selectedResource) {
      setError('Please select a resource.');
      return;
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/bom-resources`,
        {
          bomId,
          resourceId: selectedResource,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSelectedResource('');
      setQuantity(1);
      setError('');
      if (onResourceAdded) {
        onResourceAdded(response.data.bomResource);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error adding BOM Resource.');
    }
  };

  return (
    <FormContainer>
      <h3>Add BOM Resource</h3>
      <form onSubmit={handleAddResource}>
        <Label>Resource:</Label>
        <Select
          value={selectedResource}
          onChange={(e) => setSelectedResource(e.target.value)}
          required
        >
          <option value="">Select Resource</option>
          {resources.map((res) => (
            <option key={res._id} value={res._id}>
              {res.name}
            </option>
          ))}
        </Select>
        <Label>Quantity:</Label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          required
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Add Resource</Button>
      </form>
    </FormContainer>
  );
};

export default AddBOMResourceForm;
