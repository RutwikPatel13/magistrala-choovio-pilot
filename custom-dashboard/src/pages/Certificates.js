import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiShield,
  FiKey,
  FiLock,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiSearch,
  FiFilter,
  FiCertificate,
  FiCalendar
} from 'react-icons/fi';
import magistralaApi from '../services/magistralaApi';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #2C5282, #ED8936);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #2C5282, #3182CE);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(44, 82, 130, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  
  .stat-icon {
    background: ${props => props.iconBg || 'linear-gradient(135deg, #2C5282, #3182CE)'};
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #718096;
    font-size: 0.9rem;
  }
`;

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #ebf8ff, #e6fffa);
  border: 1px solid #bee3f8;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  
  .banner-icon {
    color: #3182ce;
    font-size: 1.25rem;
    margin-top: 0.125rem;
  }
  
  .banner-content {
    flex: 1;
    
    .banner-title {
      font-weight: 600;
      color: #2c5282;
      margin-bottom: 0.5rem;
    }
    
    .banner-text {
      color: #2d3748;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }
`;

const FiltersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2d3748;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const CertificatesContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const CertificatesHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CertificatesTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const CertificatesList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const CertificateItem = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f7fafc;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f7fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CertificateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CertificateInfo = styled.div`
  flex: 1;
`;

const CertificateName = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CertificateDescription = styled.div`
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const CertificateMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #718096;
  flex-wrap: wrap;
`;

const CertificateActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallActionButton = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }
  
  &.status-valid {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
  
  &.status-expired {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }
  
  &.status-expiring {
    background: #f59e0b;
    color: white;
    border-color: #f59e0b;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 1rem 0;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.valid {
      background: #10b981;
    }
    
    &.expired {
      background: #ef4444;
    }
    
    &.expiring {
      background: #f59e0b;
    }
  }
  
  .status-text {
    font-size: 0.9rem;
    font-weight: 500;
    
    &.valid {
      color: #10b981;
    }
    
    &.expired {
      color: #ef4444;
    }
    
    &.expiring {
      color: #f59e0b;
    }
  }
`;

const CertificateDetails = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  font-size: 0.85rem;
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    
    .detail-label {
      font-weight: 600;
      color: #4a5568;
    }
    
    .detail-value {
      color: #2d3748;
      word-break: break-all;
    }
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .empty-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #4a5568;
  }
  
  .empty-text {
    font-size: 0.9rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #2C5282, #3182CE);
    color: white;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(44, 82, 130, 0.3);
    }
  ` : `
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
    &:hover {
      background: #edf2f7;
    }
  `}
`;

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [formData, setFormData] = useState({
    thing_id: '',
    type: 'x509',
    algorithm: 'RSA-2048',
    valid_for: '365',
    certificate: '',
    private_key: '',
    ca_certificate: ''
  });

  const [stats, setStats] = useState({
    totalCertificates: 0,
    validCertificates: 0,
    expiringCertificates: 0,
    expiredCertificates: 0
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      // Note: This is a mock implementation as Certificates service
      // is typically used with actual PKI infrastructure
      const mockCertificates = getMockCertificates();
      setCertificates(mockCertificates);
      
      // Calculate stats
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      setStats({
        totalCertificates: mockCertificates.length,
        validCertificates: mockCertificates.filter(cert => {
          const expiry = new Date(cert.expires_at);
          return expiry > now;
        }).length,
        expiringCertificates: mockCertificates.filter(cert => {
          const expiry = new Date(cert.expires_at);
          return expiry > now && expiry <= thirtyDaysFromNow;
        }).length,
        expiredCertificates: mockCertificates.filter(cert => {
          const expiry = new Date(cert.expires_at);
          return expiry <= now;
        }).length
      });
    } catch (error) {
      console.error('Failed to load certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockCertificates = () => {
    const now = new Date();
    return [
      {
        id: 'cert-001',
        thing_id: 'thing-temp-sensor-001',
        type: 'x509',
        subject: 'CN=Temperature Sensor 001,O=Magistrala IoT',
        issuer: 'CN=Magistrala CA,O=Magistrala IoT Platform',
        serial_number: '1a:2b:3c:4d:5e:6f',
        algorithm: 'RSA-2048',
        fingerprint: 'SHA256:a1b2c3d4e5f6...',
        issued_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'valid',
        usage: ['client_auth', 'digital_signature']
      },
      {
        id: 'cert-002',
        thing_id: 'thing-humidity-sensor-002',
        type: 'x509',
        subject: 'CN=Humidity Sensor 002,O=Magistrala IoT',
        issuer: 'CN=Magistrala CA,O=Magistrala IoT Platform',
        serial_number: '2b:3c:4d:5e:6f:7a',
        algorithm: 'ECDSA-P256',
        fingerprint: 'SHA256:b2c3d4e5f6a7...',
        issued_at: new Date(now.getTime() - 350 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'expiring',
        usage: ['client_auth', 'digital_signature']
      },
      {
        id: 'cert-003',
        thing_id: 'thing-pressure-sensor-003',
        type: 'x509',
        subject: 'CN=Pressure Sensor 003,O=Magistrala IoT',
        issuer: 'CN=Magistrala CA,O=Magistrala IoT Platform',
        serial_number: '3c:4d:5e:6f:7a:8b',
        algorithm: 'RSA-2048',
        fingerprint: 'SHA256:c3d4e5f6a7b8...',
        issued_at: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'expired',
        usage: ['client_auth', 'digital_signature']
      }
    ];
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = (cert.thing_id && cert.thing_id.toLowerCase().includes(filters.search.toLowerCase())) ||
                         (cert.subject && cert.subject.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = filters.status === 'all' || cert.status === filters.status;
    const matchesType = filters.type === 'all' || cert.type === filters.type;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateCertificate = () => {
    setEditingCertificate(null);
    setFormData({
      thing_id: '',
      type: 'x509',
      algorithm: 'RSA-2048',
      valid_for: '365',
      certificate: '',
      private_key: '',
      ca_certificate: ''
    });
    setShowModal(true);
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      thing_id: certificate.thing_id || '',
      type: certificate.type || 'x509',
      algorithm: certificate.algorithm || 'RSA-2048',
      valid_for: '365',
      certificate: certificate.certificate || '',
      private_key: certificate.private_key || '',
      ca_certificate: certificate.ca_certificate || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Note: In a real implementation, this would call the Magistrala Certificates API
      console.log('Certificate operation:', editingCertificate ? 'update' : 'create', formData);
      
      // Mock certificate generation/update
      if (editingCertificate) {
        alert('Certificate updated successfully!\n(Mock implementation)');
      } else {
        alert('Certificate generated successfully!\n(Mock implementation)');
      }
      
      setShowModal(false);
      await loadCertificates();
    } catch (error) {
      console.error('Failed to save certificate:', error);
      alert('Failed to save certificate. Please try again.');
    }
  };

  const handleRevokeCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Revoking certificate:', certificateId);
      alert('Certificate revoked successfully!\n(Mock implementation)');
      await loadCertificates();
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
      alert('Failed to revoke certificate. Please try again.');
    }
  };

  const handleDownloadCertificate = (certificate) => {
    // Mock certificate download
    const certContent = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL4L4L4L4L4MA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjMwMTAxMDAwMDAwWhcNMjQwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA...mock_certificate_content...
-----END CERTIFICATE-----`;

    const blob = new Blob([certContent], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certificate.thing_id}_certificate.pem`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCertificateStatus = (certificate) => {
    const now = new Date();
    const expiry = new Date(certificate.expires_at);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (expiry <= now) return 'expired';
    if (expiry <= thirtyDaysFromNow) return 'expiring';
    return 'valid';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  const formatExpiryStatus = (certificate) => {
    const status = getCertificateStatus(certificate);
    const expiry = new Date(certificate.expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    switch (status) {
      case 'valid':
        return `Expires in ${daysUntilExpiry} days`;
      case 'expiring':
        return `Expires in ${daysUntilExpiry} days (Warning)`;
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <FiRefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading certificates...</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Certificates & mTLS</Title>
        <ActionButton onClick={handleCreateCertificate}>
          <FiPlus /> Generate Certificate
        </ActionButton>
      </Header>

      <InfoBanner>
        <div className="banner-icon">
          <FiShield />
        </div>
        <div className="banner-content">
          <div className="banner-title">Mutual TLS Authentication</div>
          <div className="banner-text">
            Manage X.509 certificates for secure device authentication using mutual TLS (mTLS). 
            Certificates provide cryptographic identity verification and secure communication channels 
            between IoT devices and the Magistrala platform.
          </div>
        </div>
      </InfoBanner>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiCertificate />
          </div>
          <div className="stat-value">{stats.totalCertificates}</div>
          <div className="stat-label">Total Certificates</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-value">{stats.validCertificates}</div>
          <div className="stat-label">Valid Certificates</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-value">{stats.expiringCertificates}</div>
          <div className="stat-label">Expiring Soon</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #ef4444, #dc2626)">
          <div className="stat-icon">
            <FiXCircle />
          </div>
          <div className="stat-value">{stats.expiredCertificates}</div>
          <div className="stat-label">Expired</div>
        </StatCard>
      </StatsGrid>

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Search Certificates</Label>
            <Input
              type="text"
              placeholder="Search by thing ID or subject..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="valid">Valid Only</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired Only</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <Label>Type</Label>
            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="x509">X.509</option>
              <option value="rsa">RSA</option>
              <option value="ecdsa">ECDSA</option>
            </Select>
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      <CertificatesContainer>
        <CertificatesHeader>
          <CertificatesTitle>Device Certificates ({filteredCertificates.length})</CertificatesTitle>
        </CertificatesHeader>
        
        <CertificatesList>
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((certificate) => {
              const status = getCertificateStatus(certificate);
              return (
                <CertificateItem key={certificate.id}>
                  <CertificateHeader>
                    <CertificateInfo>
                      <CertificateName>
                        <FiKey />
                        {certificate.thing_id}
                      </CertificateName>
                      <CertificateDescription>
                        {certificate.subject}
                      </CertificateDescription>
                      <CertificateMeta>
                        <span>Serial: {certificate.serial_number}</span>
                        <span>Algorithm: {certificate.algorithm}</span>
                        <span>Issued: {formatTimestamp(certificate.issued_at)}</span>
                        <span>Expires: {formatTimestamp(certificate.expires_at)}</span>
                      </CertificateMeta>
                    </CertificateInfo>
                    <CertificateActions>
                      <SmallActionButton onClick={() => handleEditCertificate(certificate)}>
                        <FiEye />
                      </SmallActionButton>
                      <SmallActionButton onClick={() => handleDownloadCertificate(certificate)}>
                        <FiDownload />
                      </SmallActionButton>
                      <SmallActionButton 
                        className={`status-${status}`}
                        title={formatExpiryStatus(certificate)}
                      >
                        {status === 'valid' && <FiCheckCircle />}
                        {status === 'expiring' && <FiAlertTriangle />}
                        {status === 'expired' && <FiXCircle />}
                      </SmallActionButton>
                      <SmallActionButton onClick={() => handleRevokeCertificate(certificate.id)}>
                        <FiTrash2 />
                      </SmallActionButton>
                    </CertificateActions>
                  </CertificateHeader>

                  <StatusIndicator>
                    <div className={`status-dot ${status}`}></div>
                    <span className={`status-text ${status}`}>
                      {formatExpiryStatus(certificate)}
                    </span>
                  </StatusIndicator>

                  <CertificateDetails>
                    <div className="detail-item">
                      <div className="detail-label">Issuer</div>
                      <div className="detail-value">{certificate.issuer}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Fingerprint</div>
                      <div className="detail-value">{certificate.fingerprint}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Usage</div>
                      <div className="detail-value">{certificate.usage?.join(', ') || 'client_auth'}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Type</div>
                      <div className="detail-value">{certificate.type?.toUpperCase()}</div>
                    </div>
                  </CertificateDetails>
                </CertificateItem>
              );
            })
          ) : (
            <EmptyState>
              <div className="empty-icon">
                <FiCertificate />
              </div>
              <div className="empty-title">No Certificates Found</div>
              <div className="empty-text">
                Generate your first X.509 certificate for secure device authentication
              </div>
            </EmptyState>
          )}
        </CertificatesList>
      </CertificatesContainer>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <h2>{editingCertificate ? 'Certificate Details' : 'Generate New Certificate'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Thing ID</Label>
                <Input
                  type="text"
                  value={formData.thing_id}
                  onChange={(e) => setFormData({ ...formData, thing_id: e.target.value })}
                  required
                  placeholder="Enter Thing ID for certificate"
                  disabled={editingCertificate}
                />
              </FormGroup>

              <FormGroup>
                <Label>Certificate Type</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={editingCertificate}
                >
                  <option value="x509">X.509</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Algorithm</Label>
                <Select
                  value={formData.algorithm}
                  onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
                  disabled={editingCertificate}
                >
                  <option value="RSA-2048">RSA 2048-bit</option>
                  <option value="RSA-4096">RSA 4096-bit</option>
                  <option value="ECDSA-P256">ECDSA P-256</option>
                  <option value="ECDSA-P384">ECDSA P-384</option>
                </Select>
              </FormGroup>

              {!editingCertificate && (
                <FormGroup>
                  <Label>Valid For (days)</Label>
                  <Input
                    type="number"
                    value={formData.valid_for}
                    onChange={(e) => setFormData({ ...formData, valid_for: e.target.value })}
                    min="1"
                    max="3650"
                    placeholder="365"
                  />
                </FormGroup>
              )}

              {editingCertificate && (
                <>
                  <FormGroup>
                    <Label>Certificate (PEM Format)</Label>
                    <TextArea
                      value={formData.certificate}
                      onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      readOnly
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Private Key (PEM Format)</Label>
                    <TextArea
                      value={formData.private_key}
                      onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                      placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                      readOnly
                    />
                  </FormGroup>
                </>
              )}

              <ButtonGroup>
                <Button type="button" onClick={() => setShowModal(false)}>
                  {editingCertificate ? 'Close' : 'Cancel'}
                </Button>
                {!editingCertificate && (
                  <Button type="submit" variant="primary">
                    Generate Certificate
                  </Button>
                )}
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Certificates;