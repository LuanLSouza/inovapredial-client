# Inova Predial - Cliente

Sistema de gestão eficiente da manutenção predial.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação
- **Login com API**: Comunicação com backend para autenticação
- **Armazenamento de Token**: JWT salvo no localStorage
- **Validação de Token**: Verificação de expiração automática
- **Headers de Autenticação**: Método para incluir token em requisições

### 🎨 Interface
- **Design Responsivo**: Baseado no Figma fornecido
- **Feedback Visual**: Loading e toast messages
- **Tratamento de Erros**: Mensagens específicas para diferentes erros

## ⚙️ Configuração

### 1. URL da API
Edite o arquivo `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // Sua URL da API
};
```

### 2. Endpoint de Login
A API deve ter um endpoint `/auth/login` que aceita:
```json
{
  "login": "email@exemplo.com",
  "senha": "senha123"
}
```

E retorna:
```json
{
  "token": "jwt_token_aqui"
}
```

## 🔧 Como Usar

### Login
1. Preencha email e senha
2. Clique em "Entrar"
3. O token será salvo automaticamente

### Usar Token em Outras Requisições
```typescript
// Em outros serviços
const headers = this.authService.getAuthHeaders();
this.http.get('/api/dados', { headers }).subscribe(...)
```

### Verificar Autenticação
```typescript
if (this.authService.isAuthenticated()) {
  // Usuário está logado
}
```

### Logout
```typescript
this.authService.logout();
```

## 📱 Executar o Projeto

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm start

# Build para produção
npm run build
```

## ⚠️ Configuração de CORS

O projeto está configurado para fazer requisições diretas para `http://localhost:8080`.

**Requisito**: O backend DEVE ter CORS configurado para aceitar `http://localhost:4200`.

### Configuração recomendada no Spring Boot:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## 🛠️ Tecnologias

- **Angular 20**: Framework principal
- **Ionic 8**: UI components
- **TypeScript**: Linguagem de programação
- **RxJS**: Programação reativa
- **SCSS**: Estilização

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── login/           # Página de login
│   ├── services/        # Serviços (AuthService)
│   └── app.routes.ts    # Configuração de rotas
├── assets/
│   ├── icons/          # Ícones SVG
│   └── images/         # Imagens
└── environments/       # Configurações de ambiente
```

## 🔐 Segurança

- Token JWT armazenado no localStorage
- Validação automática de expiração
- Headers de autenticação para requisições protegidas
- Tratamento seguro de erros de autenticação
