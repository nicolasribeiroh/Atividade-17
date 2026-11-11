// script.js - URL da API RELATIVA (Atividade 16)
// Funciona em qualquer dominio (localhost ou Render).
// Atividade 19: trocar pela URL da API no Render.
// Atividade 20: trocar por 'http://localhost:8081/produtos'.
const API_BASE_URL = '/produtos';

const produtoForm = document.getElementById('produtoForm');
const produtosList = document.getElementById('produtosList');
const inputId = document.getElementById('produtoId');
const inputNome = document.getElementById('nome');
const inputPreco = document.getElementById('preco');
const formTitulo = document.getElementById('formTitulo');
const btnCancelar = document.getElementById('btnCancelar');
const mensagem = document.getElementById('mensagem');

document.getElementById('apiUrl').textContent = API_BASE_URL;
document.getElementById('btnAtualizar').addEventListener('click', listarProdutos);
btnCancelar.addEventListener('click', limparFormulario);

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = 'mensagem ' + tipo;
    mensagem.hidden = false;
    setTimeout(() => { mensagem.hidden = true; }, 4000);
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapar(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// READ - GET /produtos
async function listarProdutos() {
    try {
        const resposta = await fetch(API_BASE_URL);
        if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
        const produtos = await resposta.json();

        if (!produtos.length) {
            produtosList.innerHTML = '<tr><td colspan="4" class="vazio">Nenhum produto cadastrado.</td></tr>';
            return;
        }
        produtosList.innerHTML = produtos.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${escapar(p.nome)}</td>
                <td>${formatarPreco(p.preco)}</td>
                <td class="acoes">
                    <button class="pequeno" onclick="editarProduto(${p.id}, '${escapar(p.nome).replace(/'/g, "\\'")}', ${p.preco})">Editar</button>
                    <button class="pequeno perigo" onclick="excluirProduto(${p.id})">Excluir</button>
                </td>
            </tr>`).join('');
    } catch (erro) {
        produtosList.innerHTML = '<tr><td colspan="4" class="vazio">Não foi possível conectar à API (' +
            erro.message + '). Verifique se o backend está rodando.</td></tr>';
    }
}

// CREATE (POST) e UPDATE (PUT)
produtoForm.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const produto = { nome: inputNome.value.trim(), preco: parseFloat(inputPreco.value) };
    const id = inputId.value;

    try {
        const resposta = await fetch(id ? `${API_BASE_URL}/${id}` : API_BASE_URL, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });
        if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
        mostrarMensagem(id ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!', 'sucesso');
        limparFormulario();
        listarProdutos();
    } catch (erro) {
        mostrarMensagem('Erro ao salvar produto: ' + erro.message, 'erro');
    }
});

function editarProduto(id, nome, preco) {
    inputId.value = id;
    inputNome.value = nome;
    inputPreco.value = preco;
    formTitulo.textContent = 'Editar Produto #' + id;
    btnCancelar.hidden = false;
}

// DELETE /produtos/{id}
async function excluirProduto(id) {
    if (!confirm('Deseja realmente excluir o produto #' + id + '?')) return;
    try {
        const resposta = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
        mostrarMensagem('Produto excluído com sucesso!', 'sucesso');
        listarProdutos();
    } catch (erro) {
        mostrarMensagem('Erro ao excluir produto: ' + erro.message, 'erro');
    }
}

function limparFormulario() {
    produtoForm.reset();
    inputId.value = '';
    formTitulo.textContent = 'Cadastrar Produto';
    btnCancelar.hidden = true;
}

listarProdutos();
