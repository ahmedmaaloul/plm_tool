// src/pages/Register.js
import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f4ff;
`;

const FormWrapper = styled.div`
  background-color: #4267B2;
  padding: 40px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  color: #f0f4ff;
  text-align: center;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #f0f4ff;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  border: none;
  border-radius: 5px;
`;

const SubmitButton = styled.button`
  background-color: #f0f4ff;
  color: #4267B2;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #d8e4fb;
  }
`;

const LoginLink = styled.p`
  color: #f0f4ff;
  text-align: center;
  margin-top: 15px;

  a {
    color: #d8e4fb;
    font-weight: bold;
    text-decoration: none;

    &:hover {
      color: #f0f4ff;
    }
  }
`;

const ErrorMessage = styled.p`
  color: #f0f4ff;
  background-color: #4267B2;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
`;


const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (userInfo.password !== userInfo.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Call register function from AuthContext
      const result = await register(userInfo.name, userInfo.username, userInfo.password);
      if (result.success) {
        navigate('/'); // Redirect to home page
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <RegisterContainer>
      <FormWrapper>
        <FormTitle>Register to Bena</FormTitle>
        <Form onSubmit={handleSubmit}>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={userInfo.name}
            onChange={handleChange}
            required
          />

          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="username"
            value={userInfo.username}
            onChange={handleChange}
            required
          />

          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={userInfo.password}
            onChange={handleChange}
            required
          />

          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={userInfo.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit">Register</SubmitButton>
        </Form>
        <LoginLink>
          Already have an account? <Link to="/login">Login</Link>
        </LoginLink>
      </FormWrapper>
    </RegisterContainer>
  );
};

export default Register;
