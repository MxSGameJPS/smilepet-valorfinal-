import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // O Mercado Livre envia notificações de tópicos como 'items', 'orders', 'questions', etc.
    // Estrutura básica do body: { _id, resource, user_id, topic, application_id, attempts, sent, received }

    console.log("Webhook Notification Received:", body);

    // Você deve retornar 200 OK rapidamente para confirmar o recebimento.
    // Processamento pesado deve ser feito em segundo plano (background job) se possível.

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
