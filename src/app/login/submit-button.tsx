'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ComponentProps } from 'react'

type SubmitButtonProps = ComponentProps<typeof Button> & {
    children: React.ReactNode
}

export function SubmitButton({ children, ...props }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button {...props} disabled={pending || props.disabled}>
            {pending && <Loader2 className="animate-spin" />}
            {children}
        </Button>
    )
}
