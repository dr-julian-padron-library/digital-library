
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
    // Parse initial value
    const [type, setType] = useState<string>('V');
    const [number, setNumber] = useState<string>('');

    useEffect(() => {
        if (value) {
            const match = value.match(/^([VEJ])([0-9]*)$/i);
            if (match) {
                setType(match[1].toUpperCase());
                setNumber(match[2]);
            } else {
                // Fallback for just numbers or invalid formats
                // If it's just numbers, assume V? Or just keep it in number?
                // Let's assume if it doesn't start with VEJ, it's all number
                const cleanValue = value.replace(/[^0-9]/g, '');
                if (cleanValue) {
                    setNumber(cleanValue);
                    // Keep existing type if possible, or default to V
                }
            }
        } else {
            setNumber('');
        }
    }, [value]);

    const handleTypeChange = (newType: string) => {
        setType(newType);
        triggerChange(newType, number);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNumber = e.target.value.replace(/[^0-9]/g, '');
        setNumber(newNumber);
        triggerChange(type, newNumber);
    };

    const triggerChange = (t: string, n: string) => {
        if (onChange) {
            onChange(`${t}${n}`);
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
