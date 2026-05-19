"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RACES } from "@/lib/tormenta/races";
import { CLASSES } from "@/lib/tormenta/classes";
import type { AbilityKey } from "@/lib/tormenta/races";
import { StepRace } from "./steps/StepRace";
import { StepClass } from "./steps/StepClass";
import { StepBackground } from "./steps/StepBackground";
import { StepAttrs } from "./steps/StepAttrs";
import { StepDesc } from "./steps/StepDesc";
import { StepEquipment } from "./steps/StepEquipment";
import { StepReview } from "./steps/StepReview";


