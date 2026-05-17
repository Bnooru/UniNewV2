# UniNewV2
# 🌐 UniNew  

![Status](https://img.shields.io/badge/em_andamento-90%25-orange)
![ADS](https://img.shields.io/badge/Projeto%20Integrador-ADS-blue)
![FeitoCom](https://img.shields.io/badge/Feito%20com-❤️-red)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-yellow)
![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Versionamento](https://img.shields.io/badge/Controle%20de%20Versão-GitHub-black)

---

Este é um **projeto integrador** desenvolvido para o curso de **Análise e Desenvolvimento de Sistemas (ADS)**, realizado pelos integrantes do **Grupo 14**.  
O sistema **UniNew** tem como objetivo centralizar e simplificar o gerenciamento de informações acadêmicas de **alunos, docentes, funcionários e fornecedores**, proporcionando uma interface simples e funcional.

---

## 🧩 Descrição do Aplicativo

O **UniNew** é uma aplicação web que permite o **cadastro, consulta e gerenciamento de usuários** (alunos, docentes, fornecedores e administrativos).  
O sistema foi desenvolvido de forma totalmente **estática no front-end**, utilizando **HTML, CSS e JavaScript**, e integrado a um **back-end em Node.js** para manipulação de dados e autenticação de usuários.

Durante o desenvolvimento, o foco foi em manter a **usabilidade e clareza da navegação**, permitindo que cada tipo de conta tenha acesso a funcionalidades específicas.

---

## 👥 Integrantes
- **Bruno Henrique Meira da Silva**  
- **Felipe Silva dos Santos Gomes**  
- **Gustavo Miguel Mayer**  
- **Mateus Henrique Ferreira** 
- **Wilgner Feliciano Rizzi**  

---

## 🧠 Pontos de Avaliação


- **Frontend**: HTML, CSS e JavaScript (sem frameworks)
- **Backend**: 
- **Controle de versão**: Git e GitHub


---

## 🎥 Vídeo Explicativo


---

## ⚙️ Funcionamento
- O usuario ao  logar com login e senha será verificado se as credenciais estão corretas.
- Caso afirmativo, a página é redirecionada para o dashboard do respectivo tipo de usuário (Aluno, Docente, Administrativo ou Gerente).
- Aluno -> pagina do aluno contendo informações sobre notas, curso e etc, professor -> págida do professor para administrar a sua diciplina, administrador -> dashboard administrador para controlar o pessoal e materias e cursos.
- Para criar novos alunos ou docentes, o usuário deve clicar em “Primeira vez aqui?” na tela de login e preencher o cadastro.

---
## 🗂 Estrutura do Projeto
````
UniNewV2
├── Assets
│   └── Logo.png
├── Js
│   └── global.js
├── Pages
│   ├── Admin
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── Aluno
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── Cadastro
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── Cursos
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── Disciplinas
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── Fornecedores-Adicionar
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── Fornecedores
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── Pessoas-Adicionar
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   ├── Pessoas
│   │   ├── index.html
│   │   ├── script.js
│   │   └── style.css
│   └── Professor
│       ├── index.html
│       ├── script.js
│       └── style.css
└── Styles
│   └── global.css
├── backend
│   ├── src
│   │   ├── middleware
│   │   │   └── auth.js
│   │   ├── routes
│   │   │   ├── auth.js
│   │   │   ├── cursos.js
│   │   │   ├── disciplinas.js
│   │   │   ├── fornecedores.js
│   │   │   ├── notas.js
│   │   │   └── pessoas.js
│   │   ├── db.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── db
│   ├── 01_schema.sql
│   └── 02_seed.sql
`````
---

📘 **UniNew - Projeto Integrador ADS**  
Feito com ❤️ pela equipe do **Grupo 14**
