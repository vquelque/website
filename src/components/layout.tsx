import React from "react"
import Header from "../components/header"

const Layout: React.FC = ({ children }) => (
<>
  <div className="container mx-auto h-screen md:w-9/12">
    {/* <Header/> */}
    {children}
  </div>
  </>
)

export default Layout
