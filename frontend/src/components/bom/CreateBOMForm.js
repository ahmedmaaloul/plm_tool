// src/components/CreateBOMForm.jsx

import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const FormContainer = styled.div`
  margin-top: 20px;
`;

const Input = styled.input`
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
  margin-top: 10px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-top: 10px;
  display: block;
`;

const ErrorMessage = styled.p`
  color: red;
`;

const CreateBOMForm = ({ referenceId, onBOMCreated }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/bom`,
        { name, referenceId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      onBOMCreated(response.data.bom);
      setName('');
      setError('');
    } catch (err) {
      console.log(err)
      setError('Error creating BOM.');
    }
  };

  return (
    <FormContainer>
      <h3>Create BOM</h3>
      <form onSubmit={handleSubmit}>
        <Label>Name:</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">Create BOM</Button>
      </form>
    </FormContainer>
  );
};

export default CreateBOMForm;
