import { HeaderContainer, Toolbar } from './style';

export const Header = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <HeaderContainer>
      <Toolbar>
        {title}
        <div style={{ flexGrow: 1 }} />
        {children}
      </Toolbar>
    </HeaderContainer>
  );
};
