export { AuthService } from './auth.service';
export { UserService } from './user.service';
export { ProductService } from './product.service';
export { InteractionService } from './interaction.service';
export { MessageService } from './message.service';
export { CategoryService } from './category.service';

export type { DadosCriarUsuario, DadosLogin, PayloadJWT } from './auth.service';
export type { DadosAtualizarUsuario } from './user.service';
export type { DadosCriarProduto, DadosAtualizarProduto, FiltrosProduto } from './product.service';
export type { DadosCriarLike, DadosCriarDislike, DadosCriarSuperLike } from './interaction.service';
export type { DadosEnviarMensagem } from './message.service';