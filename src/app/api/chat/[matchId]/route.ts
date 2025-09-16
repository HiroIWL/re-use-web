import { MessageService } from "../../../../services/message.service";
import { createApiHandler, ApiResponseBuilder, ValidationRule } from "../../../../lib/api";

const sendMessageValidations: ValidationRule[] = [
  { field: 'conteudo', required: true, type: 'string', min: 1, max: 1000 }
];

export const GET = createApiHandler(
  async (request, { user, params }) => {
    const matchId = Number(params!.matchId);
    
    if (isNaN(matchId)) {
      return ApiResponseBuilder.validationError('matchId', 'ID do match deve ser um número válido');
    }

    const mensagens = await MessageService.obterMensagensMatch(user!.id, matchId);

    return ApiResponseBuilder.success(
      { mensagens },
      "Mensagens obtidas com sucesso"
    );
  },
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);

export const POST = createApiHandler(
  async (request, { user, params, body }) => {
    const matchId = Number(params!.matchId);
    
    if (isNaN(matchId)) {
      return ApiResponseBuilder.validationError('matchId', 'ID do match deve ser um número válido');
    }

    if (!body || typeof body !== 'object' || !('conteudo' in body)) {
      return ApiResponseBuilder.validationError('conteudo', 'Conteúdo da mensagem é obrigatório');
    }

    const { conteudo } = body as { conteudo: string };
    
    if (!conteudo || typeof conteudo !== 'string' || !conteudo.trim()) {
      return ApiResponseBuilder.validationError('conteudo', 'Conteúdo da mensagem é obrigatório');
    }

    const mensagem = await MessageService.enviarMensagem({
      idUsuario: user!.id,
      idMatch: matchId,
      conteudo: conteudo.trim()
    });

    return ApiResponseBuilder.success(
      { mensagem },
      "Mensagem enviada com sucesso",
      201
    );
  },
  {
    requireAuth: true,
    validations: sendMessageValidations,
    allowedMethods: ['POST']
  }
);
