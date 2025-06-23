import React from 'react';
import styled from 'styled-components';
import { FiInfo, FiX } from 'react-icons/fi';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  max-width: 500px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #2d3748;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const Description = styled.p`
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 1.5rem -2rem;
`;

const ContactInfo = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  
  .contact-title {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }
  
  .contact-details {
    color: #4a5568;
    font-size: 0.9rem;
    
    a {
      color: #3b82f6;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const CloseButtonStyled = styled.button`
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
  margin: 0 auto;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const UpcomingFeatureModal = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FiX size={20} />
        </CloseButton>
        
        <ModalHeader>
          <IconWrapper>
            <FiInfo size={24} />
          </IconWrapper>
          <Title>Upcoming Feature</Title>
        </ModalHeader>
        
        <Description>
          The <strong>{featureName}</strong> feature is currently under development and will be available in a future release. 
          We're working hard to bring you this functionality soon!
        </Description>
        
        <Divider />
        
        <ContactInfo>
          <div className="contact-title">Need this feature sooner?</div>
          <div className="contact-details">
            Contact our team at{' '}
            <a href="mailto:support@magistrala.io">support@magistrala.io</a>{' '}
            to learn more about our roadmap or discuss priority access.
          </div>
        </ContactInfo>
        
        <CloseButtonStyled onClick={onClose}>
          Understood
        </CloseButtonStyled>
      </ModalContent>
    </Modal>
  );
};

export default UpcomingFeatureModal;