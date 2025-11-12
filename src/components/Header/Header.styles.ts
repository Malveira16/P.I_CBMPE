import styled from "styled-components";

export const Container = styled.header`
  background-color: #1E293B;
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 10vh;
  box-sizing: border-box;
  z-index: 1000;
`;

/* Brand (logo + texts) */
export const Brand = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: left;
    position: relative;
  }
`;

/* logo image */
export const BrandLogo = styled.img`
  height: 3rem;
  cursor: pointer;
  filter: brightness(0) invert(1);

  @media (max-width: 480px) {
    position: relative;
    left: 0;
    top: 0;
    transform: none;
    margin-right: 0.5rem;
    width: 2.6rem;
  }
`;

/* title + subtitle */
export const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1;

  /* em telas pequenas, mantemos o container visível
     (para permitir centralizar apenas o título) */
  @media (max-width: 480px) {
    /* não ocupar 100% da largura para não empurrar o logo para outra linha */
    display: flex;
    flex-direction: column;
    width: auto;
    position: relative;
    text-align: left;
    padding-right: 0;
    align-items: flex-start;
  }
`;

export const BrandTitle = styled.span`
  font-size: 1.05rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #ffffff;
  padding-bottom: 0.5rem;

  @media (max-width: 480px) {
    /* título permanece no fluxo ao lado do logo, centralizado verticalmente pelo Brand */
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    padding-bottom: 0;
    z-index: 1100;
    font-size: 1rem;
    display: block;
    margin: 0;
  }
`;
export const BrandSubtitle = styled.span`
  font-size: 0.85rem;
  color: #cbd5e1;

  /* esconde só o subtitle em telas pequenas */
  @media (max-width: 1080px) {
    display: none;
  }
`;

/* main menu */
export const Menu = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;

  @media (max-width: 768px) {
    display: none; /* esconde desktop menu em telas pequenas */
  }
`;

/* menu item */
export const MenuItem = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.18s ease, transform 0.08s ease;
  padding: 8px 12px;
  border-radius: 8px;

  &:hover {
    color: #ff6b6b;
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    font-size: 15px;
  }
`;

/* right side: notifications + profile */
export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

/* notification button (sino) */
export const NotificationButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

/* profile area with dropdown */
export const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;

  &:hover > div {
    display: block;
  }

  @media (max-width: 420px) {
    gap: 6px;
    & > span:first-child {
      display: none; /* esconde nome para poupar espaço extremo */
    }
  }
`;

export const ProfileIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
`;

/* profile name text */
export const ProfileName = styled.span`
  font-size: 14px;
  color: #ffffff;
  white-space: nowrap;
`;

/* dropdown placeholder (hidden by default, shows on hover) */
export const Dropdown = styled.div`
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  color: #0f172a;
  min-width: 180px;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.2);
  z-index: 2000;
  font-size: 14px;
`;

/* Hamburger (visible only em telas pequenas) */
export const MenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

/* submenu (desktop) */
export const Submenu = styled.div`
  display: none;
  position: absolute;
  /* aproximamos o submenu ao item para reduzir o "gap" que fazia desaparecer ao mover o cursor */
  top: calc(100% - 6px);
  left: 0;
  background: #ffffff;
  color: #0f172a;
  min-width: 220px;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.2);
  z-index: 1800;
  font-size: 14px;
`;

/* submenu item (usado com `as={Link}` no componente) */
export const SubmenuItem = styled.a`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  color: inherit; /* herda (desktop: escuro, mobile: branco) */
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover {
    background: rgba(2, 6, 23, 0.04);
  }

  & > span.icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    background: #334155;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 700;
  }
`;

/* Mobile menu (slide / dropdown under header) */
export const MobileMenu = styled.div<{ open: boolean }>`
  position: fixed;
  left: 12px;
  right: 12px;
  top: 72px;
  background: linear-gradient(180deg, rgba(16, 24, 39, 0.98), rgba(12, 18, 30, 0.98));
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.45);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1500;
  transform-origin: top center;
  transform: scaleY(${(p) => (p.open ? 1 : 0)});
  opacity: ${(p) => (p.open ? 1 : 0)};
  pointer-events: ${(p) => (p.open ? "auto" : "none")};
  transition: transform 160ms ease, opacity 160ms ease;
  color: #ffffff; /* garante que SubmenuItem herde branco no mobile */

  @media (min-width: 769px) {
    display: none;
  }
`;

/* === ADICIONADOS: containers e estilos para submenus (desktop + mobile) === */

export const MenuItemContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  /* mostra submenu no hover (desktop) */
  &:hover > div {
    display: block;
  }
`;

/* mobile submenu (expand/collapse) */
export const MobileSubmenu = styled.div<{ open: boolean }>`
  max-height: ${(p) => (p.open ? "800px" : "0")};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: max-height 160ms ease;
`;

/* item para mobile (usa o mesmo visual do MenuItem) */
export const MobileMenuItem = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 16px;
  text-align: left;
  padding: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;