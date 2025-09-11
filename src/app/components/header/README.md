# HeaderComponent

Componente reutilizável para o cabeçalho da aplicação.

## Uso

```typescript
import { HeaderComponent, UserInfo } from '../components';

@Component({
  imports: [HeaderComponent],
  // ...
})
export class MinhaPage {
  userInfo: UserInfo = {
    name: 'Nome do Usuário',
    role: 'Cargo',
    building: 'Nome do Edifício',
    avatar: 'caminho/para/avatar.jpg'
  };

  onLogoutClick() {
    // Implementar lógica de logout
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onBuildingDropdownClick() {
    // Implementar lógica do dropdown de edifícios
  }
}
```

```html
<app-header 
  [userInfo]="userInfo"
  (logoutClick)="onLogoutClick()"
  (buildingDropdownClick)="onBuildingDropdownClick()">
</app-header>
```

## Eventos

- `logoutClick`: Emitido quando o botão de logout é clicado
- `buildingDropdownClick`: Emitido quando o dropdown de edifícios é clicado

## Inputs

- `userInfo`: Informações do usuário (UserInfo interface)
