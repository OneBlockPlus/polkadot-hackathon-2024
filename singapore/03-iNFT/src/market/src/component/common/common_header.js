import { Container, Nav, Navbar } from "react-bootstrap";
import { useState,useEffect } from "react";

import tools from "../../lib/tools";
import RUNTIME from "../../system/runtime";

import { FaCog } from "react-icons/fa";

function Header(props) {

  let [login, setLogin]=useState("Login");

  const self={
    clickLogin:()=>{
      if(login==="Login"){
        RUNTIME.auto((addr)=>{
          console.log(addr);
          setLogin(tools.shorten(addr,5));
        });
        
      }else{
        props.link("user");
      }
    },
  }

  useEffect(() => {
    //console.log(props);
    if(props.active==="user" && login==="Login"){
      setLogin("Checking...");
      setTimeout(()=>{
        setLogin("Login");
        self.clickLogin();
      },1500);
    }
  }, [props.active]);

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand >
          <h3 className="pointer" onClick={(ev) => { props.link("bounty") }} >iNFT</h3>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={(ev) => { props.link("market") }} >
              <h5 className={props.active === "market" ? "text-warning" : ""}>Market</h5>
            </Nav.Link>
            <Nav.Link onClick={(ev) => { props.link("bounty") }} >
              <h5 className={props.active === "bounty" ? "text-warning" : ""}>Bounty</h5>
            </Nav.Link>
            {/* <Nav.Link onClick={(ev) => { props.link("explorer") }}>
              <h5 className={props.active === "explorer" ? "text-warning" : ""}>Explorer</h5>
            </Nav.Link> */}
            <Nav.Link onClick={(ev) => { props.link("playground") }}>
              <h5 className={props.active === "playground" ? "text-warning" : ""}>Playground</h5>
            </Nav.Link>
            <Nav.Link onClick={(ev) => { props.link("minter") }}>
              <h5 className={props.active === "minter" ? "text-warning" : ""}>Minter</h5>
            </Nav.Link>
            <Nav.Link onClick={(ev) => { props.link("editor") }}>
              <h5 className={props.active === "editor" ? "text-warning" : ""}>Editor</h5>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
              <button className={props.active==="user"?"btn btn-md btn-default text-info":"btn btn-md btn-default"} onClick={(ev) => { 
                self.clickLogin();
              }}>{login}</button>
            <span className="ml-5 text-secondary">|</span>
            <span className={props.active==="setting"?"pointer text-warning":"pointer"} onClick={(ev) => { 
              props.link("setting");
            }}>
              <FaCog className="ml-5" size={16} />
            </span>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;