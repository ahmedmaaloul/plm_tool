// src/components/ProjectDetailsForm.js
import React from 'react';
import styled from 'styled-components';
import { FaTag, FaBoxOpen, FaBarcode, FaSave } from 'react-icons/fa';

// Override your base styles just for this form for a crisp, carded look
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 6px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

const Label = styled.label`
  color: #4267B2;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  border: 1.5px solid #d6def7;
  background: #f5f9ff;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 1.05rem;
  transition: border 0.2s;
  &:focus {
    outline: none;
    border: 1.5px solid #4267B2;
    background: #fafdff;
  }
`;

const Select = styled.select`
  border: 1.5px solid #d6def7;
  background: #f5f9ff;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 1.05rem;
  transition: border 0.2s;
  &:focus {
    outline: none;
    border: 1.5px solid #4267B2;
    background: #fafdff;
  }
`;

const SubmitButton = styled.button`
  margin-top: 16px;
  background: linear-gradient(90deg, #4267B2 0%, #6b93e7 100%);
  color: #fff;
  font-size: 1.12rem;
  font-weight: 700;
  padding: 14px 0;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(66,103,178,0.08);
  transition: background 0.18s, box-shadow 0.18s;
  &:hover {
    background: linear-gradient(90deg, #35539a 0%, #5276bb 100%);
    box-shadow: 0 6px 24px rgba(66,103,178,0.10);
  }
`;

const ProjectDetailsForm = ({
  projectData,
  handleChange,
  handleSubmit,
  products,
  selectedProductId,
  setSelectedProductId,
  references,
  selectedReferenceId,
  setSelectedReferenceId,
}) => (
  <Form onSubmit={handleSubmit}>
    <FormGroup>
      <Label htmlFor="title">
        <FaTag /> Title
      </Label>
      <Input
        type="text"
        id="title"
        name="title"
        value={projectData.title}
        onChange={handleChange}
        placeholder="Enter project title"
        required
      />
    </FormGroup>

    <FormGroup>
      <Label>
        <FaBoxOpen /> Select Product
      </Label>
      <Select
        value={selectedProductId}
        onChange={(e) => {
          setSelectedProductId(e.target.value);
          setSelectedReferenceId('');
        }}
      >
        <option value="">Select Product</option>
        {products.map((product) => (
          <option key={product._id} value={product._id}>
            {product.name}
          </option>
        ))}
      </Select>
    </FormGroup>

    {references.length > 0 && (
      <FormGroup>
        <Label>
          <FaBarcode /> Select Reference
        </Label>
        <Select
          value={selectedReferenceId}
          onChange={(e) => setSelectedReferenceId(e.target.value)}
        >
          <option value="">Select Reference</option>
          {references.map((ref) => (
            <option key={ref._id} value={ref._id}>
              {ref.code}
            </option>
          ))}
        </Select>
      </FormGroup>
    )}

    <SubmitButton type="submit">
      <FaSave /> Save Changes
    </SubmitButton>
  </Form>
);

export default ProjectDetailsForm;
