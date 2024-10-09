// src/components/StyledComponents.js
import styled from 'styled-components';

export const Container = styled.div`
  padding: 20px;
  background-color: #fff7eb;
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

export const FormWrapper = styled.div`
  background-color: #ff5757;
  padding: 40px;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const FormTitle = styled.h2`
  color: #fff7eb;
  text-align: center;
  margin-bottom: 20px;
`;

export const FormSection = styled.div`
  margin-bottom: 30px;
`;

export const SectionTitle = styled.h3`
  color: #fff7eb;
  margin-bottom: 15px;
`;

export const ErrorMessage = styled.p`
  color: #ffd6d6;
  background-color: #ff5757;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

export const FormGroup = styled.div`
  margin-bottom: 15px;
`;

export const Label = styled.label`
  color: #fff7eb;
  margin-bottom: 5px;
  font-weight: bold;
  display: block;
`;

export const Input = styled.input`
  padding: 10px;
  border: none;
  border-radius: 5px;
  width: 100%;
`;

export const Select = styled.select`
  padding: 10px;
  border: none;
  border-radius: 5px;
  width: 100%;
`;

export const SubmitButton = styled.button`
  background-color: #fff7eb;
  color: #ff5757;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  margin-right: 10px;

  &:hover {
    background-color: #ffe6d1;
  }
`;
export const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  text-decoration: none;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;