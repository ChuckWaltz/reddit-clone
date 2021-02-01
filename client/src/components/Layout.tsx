import Navbar from "./Navbar";
import Wrapper, { WrapperSize } from "./Wrapper";

interface LayoutProps {
  size?: WrapperSize;
}

const Layout: React.FC<LayoutProps> = ({ children, size }) => {
  return (
    <>
      <Navbar />
      <Wrapper size={size}>{children}</Wrapper>
    </>
  );
};

export default Layout;
