import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { StlViewer } from "react-stl-viewer";
import { Buffer } from "buffer";
// Facebook-like blue shades
const FB_PRIMARY = "#4267B2";
const FB_DARK = "#3758a5";
const FB_LIGHT = "#e9efff";
const FB_TEXT = "#ffffff";

// Styled Components
const Container = styled.div`
  padding: 40px;
  max-width: 1000px;
  margin: 40px auto 0 auto; /* Top margin added */
  background-color: ${FB_LIGHT};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h1`
  color: ${FB_PRIMARY};
  margin-bottom: 10px;
`;

const SubHeading = styled.h2`
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
  margin-top: 30px;
  color: ${FB_PRIMARY};
  border-bottom: 2px solid ${FB_DARK};
  padding-bottom: 5px;
`;

const Button = styled.button`
  background-color: ${FB_PRIMARY};
  color: ${FB_TEXT};
  padding: 10px 16px;
  margin: 5px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${FB_DARK};
  }
`;

const DocumentForm = styled.form`
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const StyledInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  flex: 1;
  min-width: 200px;
  outline: none;

  &:focus {
    border-color: ${FB_PRIMARY};
  }
`;

const DocumentList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin-top: 20px;
`;

const DocumentItem = styled.li`
  background-color: #f0f4ff;
  border: 1px solid ${FB_PRIMARY};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const FileInfo = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const PreviewWindow = styled.div`
  position: fixed;
  top: 10%;
  left: 10%;
  width: 80vw;
  height: 80vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  border-radius: 10px;
  padding: 10px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  background: transparent;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  z-index: 10000;

  &:hover {
    color: ${FB_PRIMARY};
  }
`;


const ReferenceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reference1, setReference1] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [version, setVersion] = useState(1);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const fetchReferenceDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/api/references/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setReference1(response.data);

        const docResponse = await axios.get(`http://localhost:5005/api/documents/reference/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setDocuments(docResponse.data.documents);
      } catch (error) {
        console.error("Error fetching reference details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceDetails();
  }, [id]);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleVersionChange = (e) => setVersion(e.target.value);

  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await axios.delete(`http://localhost:5005/api/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  const handleDownload = async (documentId) => {
    if (window.confirm("Are you sure you want to download this file?")) {
      try {
        const response = await axios.get(`http://localhost:5005/api/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: "blob",
        });

        const contentDisposition = response.headers["content-disposition"];
        let filename = "downloaded_file";
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches && matches[1]) filename = matches[1];

        const blob = new Blob([response.data], { type: response.data.type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      } catch (error) {
        console.error("Error downloading document:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("filename", file.name);
    formData.append("documentType", file.type);
    formData.append("version_string", Number(version));
    formData.append("referenceId", id);
    formData.append("file", file);

    try {
      await axios.post(`http://localhost:5005/api/documents`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedDocs = await axios.get(`http://localhost:5005/api/documents/reference/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDocuments(updatedDocs.data.documents);
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  const handlePreview = (fileBuffer) => {
    const blob = new Blob([Buffer.from(fileBuffer.data)], {
      type: "application/sla",
    });
    const previewUrl = URL.createObjectURL(blob);
    setPreviewFile(previewUrl);
  };

  const handleClosePreview = () => setPreviewFile(null);

  if (loading) return <Container>Loading...</Container>;
  if (!reference1) return <Container>Reference not found.</Container>;

  const { reference } = reference1;

  return (
    <Container>
      <Heading>Reference Details</Heading>
      <SubHeading>Product: {reference.product.name}</SubHeading>
      <SubHeading>Code: {reference.code}</SubHeading>
      <Button onClick={() => navigate(`/boms/${reference.bom._id}`)}>View BOM Details</Button>

      <SectionTitle>Upload New Document</SectionTitle>
      <DocumentForm onSubmit={handleSubmit}>
        <StyledInput type="file" onChange={handleFileChange} required />
        <StyledInput
          type="number"
          placeholder="Version"
          value={version}
          onChange={handleVersionChange}
          required
        />
        <Button type="submit">Upload</Button>
      </DocumentForm>

      <SectionTitle>Documents</SectionTitle>
      {previewFile && (
        <PreviewWindow>
          <CloseButton onClick={handleClosePreview}>×</CloseButton>
          <StlViewer
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            orbitControls
            shadows
            url={previewFile}
          />
        </PreviewWindow>
      )}
      <DocumentList>
        {documents.map((doc) => (
          <DocumentItem key={doc._id}>
            <FileInfo>{doc.filename} (v{doc.version})</FileInfo>
            <ButtonGroup>
              {doc.documentType === "model/stl" && (
                <Button onClick={() => handlePreview(doc.file)}>Preview</Button>
              )}
              <Button onClick={() => handleDownload(doc._id)}>Download</Button>
              <Button onClick={() => handleDelete(doc._id)}>Delete</Button>
            </ButtonGroup>
          </DocumentItem>
        ))}
      </DocumentList>
      <Button onClick={() => navigate(-1)}>Back</Button>
    </Container>
  );
};

export default ReferenceView;
