# Online Js Compiler

![alt text](/frontend/public/images/readme.png)

### Description

Online JS Compiler is  an advanced online JavaScript code editor and compiler. It will enable users to write, compile, and execute JavaScript code directly within their web browsers leveraging Language Server Protocol (LSP) features.

### Motivation

- Develop a custom online JavaScript code editor to run code.
- Provide a platform for testing and learning JavaScript features interactively.
- Incorporate rich Language Server Protocol (LSP) features such as Autocompletion & Error Diagnostic, syntax highlighting, to enhance the developer experience.

### Features

- Code Execution: Run JavaScript code and view the output.
- Code Editor: Write and edit JavaScript code with real-time syntax highlighting and error reporting.
- LSP Integration: Auto-completion and error diagnostics using Language Server Protocol.
- File Management: Create, save, and load files; handle file operations and storage.
- Huffman Coding Implementation: To compress user code, efficiently reducing storage space.
- User Authentication: Sign up, log in, and manage user sessions.
- Password Management: Update user passwords securely.
- Theming: Toggle between light and dark modes.

### Technologies Used

1. Frontend:

   - HTML
   - Tailwind CSS
   - TypeScript
   - Iconify (for icons)

2. Backend:
   - Node.js
   - Express.js
   - PostgreSQL (database)
   - kenx(Query Builder)
   - Docker
   - Socket.io (real time lsp)
   - TypeScript Language Server (For auto-completion and error diagnostics)

Quick Start

1. With Git Clone

   - Clone the project:\
     `git clone git@github.com`

2. Use docker compose up

   `docker compose up -d`

3. Goto localhost `http://localhost:5173/` to run locally.

### Contributing

Want to contribute? Create a Pull Request!
