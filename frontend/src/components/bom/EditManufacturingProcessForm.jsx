// src/components/EditManufacturingProcessForm.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const FormContainer = styled.div`
  margin-top: 20px;
`;

const Input = styled.input`
  padding: 8px;
  margin: 5px 0;
  width: 100%;
`;

const TextArea = styled.textarea`
  padding: 8px;
  margin: 5px 0;
  width: 100%;
  height: 100px;
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
const Card = styled.div`
  border: 1px solid #ff5757;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff7eb;
  border-radius: 5px;
`;

const Select = styled.select`
  padding: 8px;
  margin: 5px 0;
  width: 100%;
`;

const Button = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px 0;
`;

const Label = styled.label`
  font-weight: bold;
  margin-top: 10px;
  display: block;
`;

const ErrorMessage = styled.p`
  color: red;
`;

const EditManufacturingProcessForm = ({ manufacturingProcess, onProcessUpdated }) => {
  const [name, setName] = useState(manufacturingProcess.name);
  const [details, setDetails] = useState(manufacturingProcess.details);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [processResources, setProcessResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  const API_BASE_URL = 'http://localhost:5000';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/resources`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setResources(response.data.resources);
        setLoadingResources(false);
      } catch (err) {
        setError('Error fetching resources.');
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const fetchProcessResources = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/process-resources/manufacturing-process/${manufacturingProcess._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setProcessResources(response.data.processResources);
      } catch (err) {
        setError('Error fetching Process Resources.');
      }
    };
    fetchProcessResources();
    // eslint-disable-next-line
  }, [manufacturingProcess._id]);

  const handleUpdateProcess = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/manufacturing-processes/${manufacturingProcess._id}`,
        { name, details },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      onProcessUpdated(response.data.manufacturingProcess);
      setError('');
    } catch (err) {
      setError('Error updating Manufacturing Process.');
    }
  };

  const handleAddProcessResource = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/process-resources`,
        {
          manufacturingProcessId: manufacturingProcess._id,
          resourceId: selectedResource,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setProcessResources([...processResources, response.data.processResource]);
      setSelectedResource('');
      setQuantity(1);
      setError('');
    } catch (err) {
      setError('Error adding Process Resource.');
    }
  };

  const handleDeleteProcessResource = async (prId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/process-resources/${prId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setProcessResources(processResources.filter((pr) => pr._id !== prId));
    } catch (err) {
      setError('Error deleting Process Resource.');
    }
  };

  return (
    <FormContainer>
      <h3>Edit Manufacturing Process</h3>
      <form onSubmit={handleUpdateProcess}>
        <Label>Name:</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Label>Details:</Label>
        <TextArea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          required
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Update Process</Button>
      </form>

      <Section>
        <SubTitle>Process Resources</SubTitle>
        {processResources.length > 0 ? (
          processResources.map((pr) => (
            <Card key={pr._id}>
              <p>
                <strong>Resource:</strong> {pr.resource.name}
              </p>
              <p>
                <strong>Quantity:</strong> {pr.quantity} {pr.resource.unit}
              </p>
              <p>
                <strong>Total Cost:</strong> ${pr.totalCost.toFixed(2)}
              </p>
              <p>
                <strong>Total Time:</strong> {pr.totalTime} hours
              </p>
              <div>
                <Link to={`/process-resources/${pr._id}/edit`}>
                  <Button>Edit</Button>
                </Link>
                <Button onClick={() => handleDeleteProcessResource(pr._id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p>No Process Resources added yet.</p>
        )}
      </Section>

      {/* Add Process Resource Form */}
      <FormContainer>
        <h4>Add Process Resource</h4>
        <form onSubmit={handleAddProcessResource}>
          <Label>Resource:</Label>
          {loadingResources ? (
            <p>Loading resources...</p>
          ) : (
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
          )}
          <Label>Quantity:</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            required
          />
          <Button type="submit">Add Process Resource</Button>
        </form>
      </FormContainer>

      {/* "Next" Button to Add Process Resources */}
      <div style={{ marginTop: '20px' }}>
        <Button onClick={() => navigate(`/manufacturing-processes/${manufacturingProcess._id}/resources/add`)}>
          Next: Add Process Resources
        </Button>
      </div>
    </FormContainer>
  );
};

export default EditManufacturingProcessForm;
