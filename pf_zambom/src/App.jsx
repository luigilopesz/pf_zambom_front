import { useEffect, useState } from 'react';
import './App.css';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

const API_BASE_URL = 'http://18.229.157.33:8080/tarefas';

function App() {
  const [token, setToken] = useState(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('');

  const [tarefas, setTarefas] = useState([]);
  const [roles, setRoles] = useState([]);

  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRoles = payload['https://musica-insper.com/roles'] || [];
      setRoles(userRoles);

      fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).then(response => {
        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        return response.json();
      })
        .then(data => setTarefas(data))
        .catch(error => {
            console.error("Erro ao buscar tarefas:", error);
            alert("Não foi possível carregar as tarefas. Verifique o console para mais detalhes.");
        });
    }
  }, [token]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      } catch (e) {
        console.error('Erro ao buscar token:', e);
      }
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  function salvarTarefa() {
    if (!titulo || !descricao || !prioridade) {
      alert("Por favor, preencha todos os campos da tarefa.");
      return;
    }
    fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        'titulo': titulo,
        'descricao': descricao,
        'prioridade': prioridade
      })
    }).then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Erro HTTP! status: ${response.status}, mensagem: ${text || 'Sem mensagem adicional'}`);
        });
      }
      return response.json();
    })
      .then(() => {
        alert("Tarefa salva com sucesso!");
        setTitulo('');
        setDescricao('');
        setPrioridade('');
        window.location.reload();
      })
      .catch(error => {
        console.error("Erro ao salvar tarefa:", error);
        alert(`Não foi possível salvar a tarefa. Detalhes: ${error.message}`);
      });
  }

  function excluirTarefa(id) {
    fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Erro HTTP! status: ${response.status}, mensagem: ${text || 'Sem mensagem adicional'}`);
        });
      }
      return response.text();
    })
      .then(() => {
        alert("Tarefa excluída com sucesso!");
        window.location.reload();
      })
      .catch(error => {
        console.error("Erro ao excluir tarefa:", error);
        alert(`Não foi possível excluir a tarefa. Detalhes: ${error.message}`);
      });
  }

  return (
      <div>
        <div className="user-info-container">
          <img src={user.picture} alt={user.name} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p><strong>Perfil:</strong> {roles.includes('ADMIN') ? 'Administrador' : 'Usuário'}</p>
          <LogoutButton />
        </div>

        {roles.includes('ADMIN') && (
          <div className="create-task-container">
            <h3>Criar Tarefa</h3>
            Título: <input type='text' value={titulo} onChange={e => setTitulo(e.target.value)} /><br />
            Descrição: <input type='text' value={descricao} onChange={e => setDescricao(e.target.value)} /><br />
            Prioridade: <input type='text' value={prioridade} onChange={e => setPrioridade(e.target.value)} /><br />
            <button onClick={salvarTarefa}>Cadastrar</button>
          </div>
        )}

        <h3>Lista de Tarefas</h3>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Descrição</th>
              <th>Prioridade</th>
              <th>Usuário</th>
              {/* Célula condicional para o cabeçalho */}
              {roles.includes('ADMIN') ? <th>Ações</th> : null}
            </tr>
          </thead>
          <tbody>
            {tarefas.map((tarefa, index) => {
              // Célula condicional para as ações de admin
              const adminActionCell = roles.includes('ADMIN') ? (
                <td>
                  <button onClick={() => excluirTarefa(tarefa.id)}>Excluir</button>
                </td>
              ) : null; // Retornar null explicitamente quando não houver célula

              return (
                <tr key={tarefa.id || index}>
                  <td>{tarefa.titulo}</td>
                  <td>{tarefa.descricao}</td>
                  <td>{tarefa.prioridade}</td>
                  {/* Certifique-se de que não há espaços literais entre estas tags <td>
                      no seu arquivo. O código abaixo está formatado para evitar isso. */}
                  <td>{tarefa.email}</td>
                  {adminActionCell}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  );
}

export default App;