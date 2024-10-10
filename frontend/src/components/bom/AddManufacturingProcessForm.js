// src/components/AddManufacturingProcessForm.jsx

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

const TextArea = styled.textarea`
  padding: 8px;
  margin: 5px 0;
  width: 100%;
  height: 100px;
`;

const ButtonGroup = styled.div`
  margin-top: 10px;
`;

const Button = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-top: 10px;
  display: block;
`;

const ErrorMessage = styled.p`
  color: red;
`;

const AddManufacturingProcessForm = ({ bomId, onProcessAdded, onNext }) => {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  const handleAddProcess = async (e, proceedToNext = false) => {
    e.preventDefault();
    if (!name || !details) {
      setError('Name and details are required.');
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/manufacturing-processes`,
        {
          bomId,
          name,
          details,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setName('');
      setDetails('');
      setError('');
      if (onProcessAdded) {
        onProcessAdded(response.data.manufacturingProcess);
      }
      if (proceedToNext && onNext) {
        onNext(response.data.manufacturingProcess);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error adding Manufacturing Process.');
    }
  };

  return (
    <FormContainer>
      <h3>Add Manufacturing Process</h3>
      <form>
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
        <ButtonGroup>
          <Button onClick={(e) => handleAddProcess(e, true)}>Add & Next</Button>
          <Button onClick={(e) => handleAddProcess(e, false)}>Add</Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default AddManufacturingProcessForm;
