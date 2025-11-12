import styled from "styled-components";

export const Background = styled.div`
  background-color: #1e293b;
`;

export const DivLogin = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const Wrapper = styled.div`
  background-color: #f5f5f5;
  width: 420px;
  max-width: 95vw;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin: 0 auto;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;

  h1 {
    margin: 0;
    font-size: 2.2rem;
    font-weight: 600;
    color: #1e293b;
  }

  h2 {
    margin: 6px 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: #334155;
    max-width: 250px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 1.8rem;
    }
    h2 {
      font-size: 0.9rem;
    }
  }
`;

export const ContainerContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

export const Label = styled.h2`
  align-self: flex-start;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 0.5rem;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const LogoLogin = styled.img`
  width: 65px;
  display: block;
  margin: 0 auto 12px auto;

  @media (max-width: 480px) {
    width: 55px;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 0.75rem;
`;

export const InputIcon = styled.img`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.7;
`;

export const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 12px 0 44px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: border 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #dc2625;
    box-shadow: 0 0 0 4px rgba(220, 38, 37, 0.12);
  }

  @media (max-width: 480px) {
    height: 40px;
  }
`;

export const RememberMeForgotPassword = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 2rem;
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }
`;

export const RememberMe = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  p {
    font-size: 0.9rem;
    color: #1e293b;
    margin: 0;
  }
`;

export const ForgotPassword = styled.div`
  a {
    color: #dc2625;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    justify-content: center;
  }
`;


export const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #dc2625;
  margin-right: 8px;
`;

export const Button = styled.button`
  width: 100%;
  height: 44px;
  background-color: #dc2625;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0 12px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  transition: background-color 0.15s ease, transform 0.08s ease;

  &:hover {
    background-color: #e43b3b;
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    height: 42px;
  }
`;
