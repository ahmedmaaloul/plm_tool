// AddManufacturingProcessForm.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Select = styled.select`
  padding: 10px;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: #4267B2;
  color: #fff7eb;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;

  &:hover {
    background-color: #3758a5;
  }
`;


const AddManufacturingProcessForm = ({ bomId, onProcessAdded }) => {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5005';

  useEffect(() => {
    // Fetch available resources
    axios
      .get(`${API_BASE_URL}/api/resources`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setResources(response.data.resources);
      })
      .catch((err) => {
        setError('Error fetching resources.');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/manufacturing-processes`,
        {
          name,
          details,
          bomId,
          resourceId,
          quantity: Number(quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      onProcessAdded(response.data.manufacturingProcess);
    } catch (err) {
      setError('Error adding manufacturing process.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Manufacturing Process</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <label>
        Name:
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Details:
        <Input value={details} onChange={(e) => setDetails(e.target.value)} required />
      </label>
      <label>
        Resource:
        <Select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          required
        >
          <option value="">Select a Resource</option>
          {resources.map((resource) => (
            <option key={resource._id} value={resource._id}>
              {resource.name}
            </option>
          ))}
        </Select>
      </label>
      <label>
        Quantity:
        <Input
          type="number"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </label>
      <Button type="submit">Add Process</Button>
    </form>
  );
};

export default AddManufacturingProcessForm;
