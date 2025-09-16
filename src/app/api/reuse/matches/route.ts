import { InteractionService } from "../../../../services/interaction.service";
import { createApiHandler, ApiResponseBuilder } from "../../../../lib/api";

export const GET = createApiHandler(
  async (request, { user }) => {
    const matches = await InteractionService.obterMatches(user!.id);

    return ApiResponseBuilder.success(
      { matches },
      "Matches obtidos com sucesso"
    );
  },
  {
    requireAuth: true,
    allowedMethods: ['GET']
  }
);