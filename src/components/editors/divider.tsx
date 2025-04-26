import { cn } from "@/lib/utils";
import React from "react";

export const Divider: React.FC<{className?: string }> =(props) => (<hr className={cn('-ml-4 -mr-4', props.className)}/>);
