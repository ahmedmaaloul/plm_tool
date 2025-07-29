// BOMDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import AddBOMResourceForm from "../../components/bom/AddBOMResourceForm";
import AddManufacturingProcessForm from "../../components/bom/AddManufacturingProcessForm";
import EditManufacturingProcessForm from "../../components/bom/EditManufacturingProcessForm";
import EditBOMResourceForm from "../../components/bom/EditBOMResourceForm";
const Container = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #4267B2;
  margin-bottom: 20px;
`;

const SubTitle = styled.h3`
  color: #4267B2;
  margin-bottom: 15px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    border: 1px solid #4267B2;
    padding: 10px;
    text-align: left;
  }

  th {
    background-color: #4267B2;
    color: #fff7eb;
  }
`;

const PieChartContainer = styled.div`
  width: 400px;
  margin: 0 auto;
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
  background-color: #f0f4ff;
  padding: 20px;
  border-radius: 10px;
  width: 600px;
  max-height: 80%;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  background-color: transparent;
  color: #4267B2;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;

  &:hover {
    color: #3758a5;
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
`;


const BOMDetails = () => {
  const { bomId } = useParams();
  const navigate = useNavigate();
  const [bom, setBOM] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showAddProcessModal, setShowAddProcessModal] = useState(false);
  const [showEditProcessModal, setShowEditProcessModal] = useState(false);
  const [processToEdit, setProcessToEdit] = useState(null);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [newBOMName, setNewBOMName] = useState("");
  const [error, setError] = useState("");

  const API_BASE_URL = 'http://localhost:5005';
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState(null);

  // Function to handle editing a BOM resource
  const handleEditBOMResource = (resource) => {
    setResourceToEdit(resource);
    setShowEditResourceModal(true);
  };

  useEffect(() => {
    const fetchBOM = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/bom/${bomId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log(response);
        setBOM(response.data.bom);
        setNewBOMName(response.data.bom.name);
      } catch (err) {
        console.log(err);
        setError("Error fetching BOM details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBOM();
  }, [bomId]);

  const handleUpdateBOMName = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/bom/${bomId}`,
        { name: newBOMName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setBOM((prev) => ({ ...prev, name: newBOMName }));
      setShowEditNameModal(false);
    } catch (err) {
      setError("Error updating BOM name.");
    }
  };

  const handleDeleteBOMResource = async (brId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/bom-resources/${brId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const deletedBR = bom.bomResources.find((br) => br._id === brId);
      setBOM((prev) => ({
        ...prev,
        bomResources: prev.bomResources.filter((br) => br._id !== brId),
        totalCost: prev.totalCost - deletedBR.totalCost,
        totalTime: prev.totalTime - deletedBR.totalTime,
      }));
    } catch (err) {
      setError("Error deleting BOM Resource.");
    }
  };

  const handleDeleteManufacturingProcess = async (mpId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/manufacturing-processes/${mpId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const deletedMP = bom.manufacturingProcesses.find(
        (mp) => mp._id === mpId
      );
      setBOM((prev) => ({
        ...prev,
        manufacturingProcesses: prev.manufacturingProcesses.filter(
          (mp) => mp._id !== mpId
        ),
        totalCost: prev.totalCost - deletedMP.totalCost,
        totalTime: prev.totalTime - deletedMP.totalTime,
      }));
    } catch (err) {
      setError("Error deleting Manufacturing Process.");
    }
  };

  const handleEditProcess = (process) => {
    setProcessToEdit(process);
    setShowEditProcessModal(true);
  };

  // Calculate totals for Pie Chart
  const calculateSpecificTotals = () => {
    if (!bom) return { bomResourcesTotal: 0, manufacturingProcessesTotal: 0 };
    const bomResourcesTotal = bom.bomResources.reduce(
      (sum, br) => sum + br.totalCost,
      0
    );
    const manufacturingProcessesTotal = bom.manufacturingProcesses.reduce(
      (sum, mp) => sum + mp.totalCost,
      0
    );
    return { bomResourcesTotal, manufacturingProcessesTotal };
  };

  const { bomResourcesTotal, manufacturingProcessesTotal } =
    calculateSpecificTotals();

  const pieData = {
    labels: ["BOM Resources", "Manufacturing Processes"],
    datasets: [
      {
        data: [bomResourcesTotal, manufacturingProcessesTotal],
        backgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  if (loading) {
    return <p>Loading BOM details...</p>;
  }

  // Only render when bom data is loaded
  if (!bom) {
    return <p>No BOM data available.</p>;
  }

  return (
    <Container>
      <Title>BOM Details</Title>
      <Section>
        <SubTitle>{bom.name}</SubTitle>
        <p>
          <strong>Total Cost:</strong> ${bom.totalCost.toFixed(2)}
        </p>
        <p>
          <strong>Total Time:</strong> {bom.totalTime} hours
        </p>
        <div>
          <Button onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => setShowAddResourceModal(true)}>
            Add BOM Resource
          </Button>
          <Button onClick={() => setShowAddProcessModal(true)}>
            Add Manufacturing Process
          </Button>
          <Button onClick={() => setShowEditNameModal(true)}>
            Edit BOM Name
          </Button>
        </div>
      </Section>

      {/* Pie Chart Section */}
      <Section>
        <SubTitle>Cost Distribution</SubTitle>
        <PieChartContainer>
          <Pie data={pieData} />
        </PieChartContainer>
      </Section>

      {/* BOM Resources Section */}
      <Section>
        <SubTitle>BOM Resources</SubTitle>
        {bom.bomResources.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Total Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bom.bomResources.map((br) => (
                <tr key={br._id}>
                  <td>{br.resource ? br.resource.name : "No Resource"}</td>
                  <td>
                    {br.quantity} {br.resource ? br.resource.unit : ""}
                  </td>
                  <td>${br.totalCost.toFixed(2)}</td>
                  <td>{br.totalTime} hours</td>
                  <td>
                    <Button onClick={() => handleEditBOMResource(br)}>
                      Edit
                    </Button>
                    <Button onClick={() => handleDeleteBOMResource(br._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No BOM Resources added yet.</p>
        )}
      </Section>

      {/* Manufacturing Processes Section */}
      <Section>
        <SubTitle>Manufacturing Processes</SubTitle>
        {bom.manufacturingProcesses.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Process Name</th>
                <th>Details</th>
                <th>Resource</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Total Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bom.manufacturingProcesses.map((mp) => (
                <tr key={mp._id}>
                  <td>{mp.name}</td>
                  <td>{mp.details}</td>
                  <td>{mp.resource ? mp.resource.name : "No Resource"}</td>
                  <td>{mp.quantity}</td>
                  <td>${mp.totalCost.toFixed(2)}</td>
                  <td>{mp.totalTime} hours</td>
                  <td>
                    <Button onClick={() => handleEditProcess(mp)}>Edit</Button>
                    <Button
                      onClick={() => handleDeleteManufacturingProcess(mp._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No Manufacturing Processes added yet.</p>
        )}
      </Section>

      {/* Add BOM Resource Modal */}
      {showAddResourceModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowAddResourceModal(false)}>
              &times;
            </CloseButton>
            <AddBOMResourceForm
              bomId={bom._id}
              onResourceAdded={(newBOMResource) => {
                // Fetch updated BOM data to ensure consistency
                setShowAddResourceModal(false);
                setLoading(true);
                axios
                  .get(`${API_BASE_URL}/api/bom/${bomId}`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  })
                  .then((response) => {
                    setBOM(response.data.bom);
                    setLoading(false);
                  })
                  .catch((err) => {
                    setError("Error fetching updated BOM.");
                    setLoading(false);
                  });
              }}
            />
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Add Manufacturing Process Modal */}
      {showAddProcessModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowAddProcessModal(false)}>
              &times;
            </CloseButton>
            <AddManufacturingProcessForm
              bomId={bom._id}
              onProcessAdded={(newProcess) => {
                // Fetch updated BOM data to ensure consistency
                setShowAddProcessModal(false);
                setLoading(true);
                axios
                  .get(`${API_BASE_URL}/api/bom/${bomId}`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  })
                  .then((response) => {
                    setBOM(response.data.bom);
                    setLoading(false);
                  })
                  .catch((err) => {
                    setError("Error fetching updated BOM.");
                    setLoading(false);
                  });
              }}
            />
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Edit Manufacturing Process Modal */}
      {showEditProcessModal && processToEdit && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowEditProcessModal(false)}>
              &times;
            </CloseButton>
            <EditManufacturingProcessForm
              manufacturingProcess={processToEdit}
              onProcessUpdated={(updatedProcess) => {
                // Fetch updated BOM data to ensure consistency
                setShowEditProcessModal(false);
                setLoading(true);
                axios
                  .get(`${API_BASE_URL}/api/bom/${bomId}`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  })
                  .then((response) => {
                    setBOM(response.data.bom);
                    setLoading(false);
                  })
                  .catch((err) => {
                    setError("Error fetching updated BOM.");
                    setLoading(false);
                  });
              }}
            />
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Edit BOM Name Modal */}
      {showEditNameModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowEditNameModal(false)}>
              &times;
            </CloseButton>
            <h3>Edit BOM Name</h3>
            <Input
              type="text"
              value={newBOMName}
              onChange={(e) => setNewBOMName(e.target.value)}
            />
            <Button onClick={handleUpdateBOMName}>Save</Button>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Error Modal */}
      {error && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setError("")}>&times;</CloseButton>
            <h3>Error</h3>
            <p>{error}</p>
            <Button onClick={() => setError("")}>Close</Button>
          </ModalContent>
        </ModalOverlay>
      )}
      {showEditResourceModal && resourceToEdit && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowEditResourceModal(false)}>
              &times;
            </CloseButton>
            <EditBOMResourceForm
              resourceToEdit={resourceToEdit}
              onResourceUpdated={() => {
                // Fetch updated BOM data after editing a resource
                setShowEditResourceModal(false);
                setLoading(true);
                axios
                  .get(`${API_BASE_URL}/api/bom/${bomId}`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  })
                  .then((response) => {
                    setBOM(response.data.bom);
                    setLoading(false);
                  })
                  .catch((err) => {
                    setError("Error fetching updated BOM.");
                    setLoading(false);
                  });
              }}
              onClose={() => setShowEditResourceModal(false)}
            />
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default BOMDetails;
