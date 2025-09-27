import React from "react";
import styled from "styled-components";
import Link from "next/link";

const CheckButton = () => {
  return (
    <StyledWrapper>
      <StyledLink href="/login">
        <span>Check Out!</span>
      </StyledLink>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
`;

const StyledLink = styled(Link)`
  display: inline-block;
  text-decoration: none;
  outline: none;
  cursor: pointer;
  border: 2px solid #66ff65;
  padding: 0.7em 1.4em;
  margin: 0;
  font-family: inherit;
  font-size: clamp(1rem, 2vw, 1.2rem);
  position: relative;
  letter-spacing: 0.05em;
  font-weight: 700;
  border-radius: 500px;
  overflow: hidden;
  background: #66ff66;
  color: ghostwhite;
  min-width: 8em;
  box-sizing: border-box;
  transition: all 0.3s ease;

  span {
    position: relative;
    z-index: 10;
    transition: color 0.4s;
    font-size: inherit;
  }

  &:hover span {
    color: black;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -10%;
    width: 120%;
    height: 100%;
    background: #000;
    transform: skew(30deg);
    transition: transform 0.4s cubic-bezier(0.3, 1, 0.8, 1);
    z-index: 0;
  }

  &:hover::before {
    transform: translate3d(100%, 0, 0);
  }

  @media (max-width: 768px) {
    padding: 0.6em 1.2em;
    font-size: clamp(0.9rem, 4vw, 1rem);
    min-width: 7em;
  }

  @media (max-width: 480px) {
    padding: 0.5em 1em;
    letter-spacing: 0.03em;
  }
`;

export default CheckButton;
