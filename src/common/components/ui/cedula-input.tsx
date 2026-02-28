
import React, { useEffect, useState } from 'react';
import { Input } from '@/common/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/common/components/ui/select';
import { cn } from '@/common/lib/utils'; // Assuming this utility exists, based on Shadcn patterns. If not, I'll check.

interface CedulaInputProps {
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    disabled?: boolean;
    id?: string;
    placeholder?: string;
}

export function CedulaInput({
    value = '',
    onChange,
    className,
    disabled,
    id,
    placeholder = '12345678',
}: CedulaInputProps) {
    const match = value.match(/^([VEJ])([0-9]*)$/i);
    const type = match ? match[1].toUpperCase() : 'V';
    const number = match ? match[2] : value.replace(/[^0-9]/g, '');

    const handleTypeChange = (newType: string) => {
        if (onChange) {
            onChange(`${newType}${number}`);
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNumber = e.target.value.replace(/[^0-9]/g, '');
        if (onChange) {
            onChange(`${type}${newNumber}`);
        }
    };



    return (
        <div className={cn('flex space-x-2', className)}>
            <Select value={type} onValueChange={handleTypeChange} disabled={disabled}>
                <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="V">V</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="J">J</SelectItem>
                </SelectContent>
            </Select>
            <Input
                id={id}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={number}
                onChange={handleNumberChange}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1"
            />
        </div>
    );
}
