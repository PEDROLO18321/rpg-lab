import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Preencha todos os campos." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 8 caracteres." },
        { status: 400 },
      );
    }

    // Normaliza antes de consultar: o email é gravado em minúsculas, então a
    // checagem de duplicata precisa usar a mesma forma — senão "A@x.com" passa
    // pela checagem e estoura na constraint única como erro 500.
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    try {
      await prisma.user.create({
        data: { name: name.trim(), email: normalizedEmail, password: hashed },
      });
    } catch (err) {
      // Corrida entre duas requisições simultâneas com o mesmo email.
      if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
        return NextResponse.json(
          { error: "Este email já está cadastrado." },
          { status: 409 },
        );
      }
      throw err;
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}
