import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  color: #ff5757;
  margin-bottom: 20px;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 200px;
`;

const Button = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th, td {
    border: 1px solid #ff5757;
    padding: 10px;
    text-align: left;
  }

  th {
    background-color: #ff5757;
    color: #fff7eb;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;

  button {
    background-color: #ff5757;
    color: #fff7eb;
    border: none;
    padding: 10px;
    margin: 0 5px;
    border-radius: 5px;
    cursor: pointer;

    &:disabled {
      background-color: #ddd;
      cursor: not-allowed;
    }
  }
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    opacity: 0.7;
  }

  svg {
    color: #ff5757;
  }
`;

const BOMList = () => {
  const [boms, setBOMs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [referenceFilter, setReferenceFilter] = useState('');
  const [filters, setFilters] = useState({});

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchBOMs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/bom`, {
          params: {
            page,
            search: searchQuery,
            reference: referenceFilter,
            ...filters, // Add any additional filters
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setBOMs(response.data.boms);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching BOMs:', err);
        setLoading(false);
      }
    };
    fetchBOMs();
  }, [page, searchQuery, referenceFilter, filters]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleReferenceFilter = (e) => {
    setReferenceFilter(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePagination = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDelete = async (bomId) => {
    if (window.confirm('Are you sure you want to delete this BOM?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bom/${bomId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setBOMs(boms.filter((bom) => bom._id !== bomId));
      } catch (err) {
        console.error('Error deleting BOM:', err);
      }
    }
  };

  if (loading) {
    return <p>Loading BOMs...</p>;
  }

  return (
    <Container>
      <Title>BOM List</Title>

      {/* Search and Filter Section */}
      <SearchContainer>
        <div>
          <Input
            type="text"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={handleSearch}
          />
          <Input
            type="text"
            placeholder="Filter by Reference"
            value={referenceFilter}
            onChange={handleReferenceFilter}
          />
        </div>
        <div>
          {/* Additional filters can be added here */}
          <Input
            type="text"
            name="project"
            placeholder="Filter by Project"
            onChange={handleFilterChange}
          />
          <Button onClick={() => setFilters({})}>Clear Filters</Button>
        </div>
      </SearchContainer>

      {/* BOM Table */}
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Reference</th>
            <th>Total Cost</th>
            <th>Total Time</th>
            <th># Processes</th> {/* New column */}
            <th># Resources</th> {/* New column */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {boms.length > 0 ? (
            boms.map((bom) => (
              <tr key={bom._id}>
                <td>{bom.name}</td>
                <td>{bom.reference ? bom.reference.code : 'N/A'}</td>
                <td>${bom.totalCost.toFixed(2)}</td>
                <td>{bom.totalTime} hours</td>
                <td>{bom.manufacturingProcesses.length}</td> {/* New data */}
                <td>{bom.bomResources.length}</td> {/* New data */}
                <td>
                  <ActionButton as={Link} to={`/boms/${bom._id}`}>
                    <FontAwesomeIcon icon={faEye} title="View Details" />
                  </ActionButton>
                  <ActionButton onClick={() => handleDelete(bom._id)}>
                    <FontAwesomeIcon icon={faTrash} title="Delete BOM" />
                  </ActionButton>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No BOMs found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination>
        <button onClick={() => handlePagination(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => handlePagination(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </Pagination>
    </Container>
  );
};

export default BOMList;
