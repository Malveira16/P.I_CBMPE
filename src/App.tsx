import { Login } from "./pages/Login";
import { Auditoria } from "./pages/auditoria/Auditoria";
import { ListaOcorrencias } from "./pages/ocorrencias/ListaOcorrencias";
import { Relatorios } from "./pages/Relatorios";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header/Header";
import { NovaOcorrencia } from "./pages/ocorrencias/CadastrarOcorrencia";
import { NovoUsuario } from "./pages/usuarios/CadastrarUsuario";
import { GestaoUsuarios } from "./pages/usuarios/GestaoUsuarios";
import { EditarUsuario } from "./pages/usuarios/EditarUsuario";
import { RelatorioRapido } from "./pages/relatorios/RelatorioRapido";
import { DashboardOperacional } from "./pages/dashboard/Dashboard";


function App() {
  return (
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<> <Header/> <DashboardOperacional/> </>}/>
        <Route path="/ocorrencias" element={<> <Header/> <ListaOcorrencias/> </>}/>
        <Route path="/relatorios" element={<> <Header/> <Relatorios/> </>}/>
        <Route path="/relatorios/rapido" element={<> <Header/> <RelatorioRapido/> </>}/>
        <Route path="/auditoria" element={<> <Header/> <Auditoria/> </>}/>
        <Route path="/usuarios" element={<> <Header/> <GestaoUsuarios/> </>}/>
        <Route path="/usuarios/cadastrar" element={<> <Header/> <NovoUsuario/> </>}/>
        <Route path="/usuarios/editar" element={<> <Header/> <EditarUsuario/> </>}/>
        <Route path="/ocorrencias/cadastrar" element={<> <Header/> <NovaOcorrencia/></>}/>
        </Routes>
        
     </BrowserRouter>
  );
}

export default App;