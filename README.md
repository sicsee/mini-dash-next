# Mini Dash - Plataforma de Gestão de Vendas (Next.js & Supabase)

## 1. Visão Geral do Projeto

O **Mini Dash** é uma plataforma *full-stack* completa projetada para a gestão integrada de vendas, estoque e cadastro de clientes. Este projeto foi desenvolvido inicialmente como um **exercício exploratório**, motivado pela curiosidade em aplicar o recém-adquirido conhecimento na biblioteca **React** e sua utilização no framework **Next.js**.

### Objetivo Central

* Implementar um sistema **CRUD** (Create, Read, Update, Delete) completo e seguro.
* Demonstrar proficiência na integração *Front-end* (Next.js) e *Back-end* (Supabase).
* Oferecer uma experiência de usuário moderna e acessível, incluindo recursos de acessibilidade como Dark/Light Mode.

## 2. Tecnologias e Arquitetura

O sistema é construído sobre um *stack* moderno e escalável, ideal para aplicações web complexas.

| Categoria | Tecnologia | Função no Projeto |
| --- | --- | --- |
| **Framework Web** | **Next.js** (React) | Interface do usuário (UI), roteamento e otimização de performance. |
| **Banco de Dados & BaaS** | **Supabase** | Backend-as-a-Service, incluindo PostgreSQL para o banco de dados, API em tempo real e gerenciamento de Autenticação. |
| **Estilização & Design** | **Tailwind CSS, Styled Componentd** | Componentização e estilização, garantindo o design responsivo e a funcionalidade Dark/Light Mode. |

### Observação sobre o Backend

Toda a **estrutura de *backend*** (tabelas SQL, regras de segurança do banco de dados - RLS, e as APIs de acesso) foi concebida e gerenciada através das ferramentas do **Supabase** e recebi total auxílio de IA para fazer o backend.

## 3. Funcionalidades de Gestão

O sistema oferece um conjunto robusto de ferramentas para o gerenciamento do negócio:

| Módulo | Tipo de Operação (CRUD) | Descrição |
| --- | --- | --- |
| **Vendas** | Registro, Visualização | Inclusão de novas transações e geração de relatórios básicos de vendas. |
| **Produtos** | CRUD | Cadastro completo de itens (nome, descrição, preço, etc.). |
| **Clientes** | CRUD | Gerenciamento de informações de contato e histórico de compras dos clientes. |
| **Estoque** | CRUD (com controle de quantidade) | Atualização do inventário após vendas ou novas aquisições de produtos. |

### Recursos Essenciais

* **Autenticação Completa:** Sistema de login e registro seguro, gerenciado pelo **Supabase Auth**.
* **Modo de Visualização:** Funcionalidade *Dark/Light Mode* para melhor ergonomia e personalização do usuário.
* **Design Responsivo:** A interface se adapta perfeitamente a *desktops*, *tablets* e *smartphones*.

## 4. Contexto de Desenvolvimento

> "Este projeto representa o meu esforço inicial na construção de aplicações *full-stack*. Foi desenvolvido em um momento de intensa aprendizagem, onde eu estava apenas começando a explorar o **React** e ainda não tinha o domínio completo do **JavaScript**. O sistema é um marco do meu processo de aprendizado, demonstrando o que é possível construir mesmo em fases iniciais de estudo, e estabelecendo a base para o desenvolvimento de práticas de código mais maduras no futuro."

## 5. Desenvolvedor

| Detalhe | Informação |
| --- | --- |
| **Nome Completo** | Nicolas David Da Silva Godinho |
| **LinkedIn** | https://www.linkedin.com/in/sicsee/ |
| **GitHub** | https://github.com/sicsee/ |
