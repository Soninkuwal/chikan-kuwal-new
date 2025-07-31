
'use client';
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Forward, MessageSquareReply, MoreHorizontal, Paperclip, Send, Smile, X } from "lucide-react"
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface RepliedTo {
    name: string;
    text: string;
}

interface Message {
    id: number;
    sender: 'User' | 'Support';
    name: string;
    avatar: string;
    text: string;
    timestamp: string;
    attachment?: {
        type: 'image' | 'video';
        url: string;
    };
    emoji?: string;
    repliedTo?: RepliedTo;
}

interface ChatInterfaceProps {
    initialMessages: Message[];
    storageKey: string;
    currentUser: { name: string, avatar: string };
    chatWith: 'Admin' | 'Owner';
}

const emojis = ['👍', '❤️', '😂', '🎉', '😢', '🔥'];

export function ChatInterface({ initialMessages, storageKey, currentUser, chatWith }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
    } else {
        setMessages(initialMessages);
        localStorage.setItem(storageKey, JSON.stringify(initialMessages));
    }

     const handleStorageChange = (event: StorageEvent) => {
        if(event.key === storageKey) {
            const updatedMessages = localStorage.getItem(storageKey);
            if (updatedMessages) {
                setMessages(JSON.parse(updatedMessages));
            }
        }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [storageKey, initialMessages]);


  const sendMessage = (text: string, emoji?: string) => {
    if (text.trim() || attachment || emoji) {
        const newMsg: Message = {
            id: messages.length + 1,
            sender: 'User',
            name: currentUser.name,
            avatar: currentUser.avatar,
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: attachment || undefined,
            emoji: emoji,
            repliedTo: replyingTo ? { name: replyingTo.name, text: replyingTo.text } : undefined,
        };
        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
        window.dispatchEvent(new StorageEvent('storage', { key: storageKey }));
        setNewMessage('');
        setAttachment(null);
        setReplyingTo(null);
    }
  }

  const handleSendMessage = () => {
    sendMessage(newMessage);
  };
  
  const handleSendEmoji = (emoji: string) => {
    sendMessage('', emoji);
  }


  const handleChatAction = (action: 'forward') => {
    toast({
        title: `Action: ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        description: `The ${action} functionality is not yet implemented.`,
    });
  }

    const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        setAttachment({ url, type });
    }
  }


  return (
    <div className="flex flex-col h-[60vh] -mx-6 -mb-6">
        <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto p-4">
            {messages.map((msg) => (
                 <div key={msg.id} className={`group flex items-end gap-3 ${msg.sender === 'User' ? 'justify-end' : ''}`}>
                    {msg.sender === 'Support' && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${msg.avatar}`} />
                            <AvatarFallback>{msg.avatar}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className="flex items-center gap-2">
                        {msg.sender === 'User' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setReplyingTo(msg)}><MessageSquareReply className="mr-2 h-4 w-4" /> Reply</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChatAction('forward')}><Forward className="mr-2 h-4 w-4" /> Forward</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'User' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                            {msg.repliedTo && (
                                <div className="p-2 mb-2 text-sm rounded-md bg-black/20">
                                    <p className="font-bold">{msg.repliedTo.name}</p>
                                    <p className="truncate opacity-80">{msg.repliedTo.text}</p>
                                </div>
                            )}
                            <p className="font-semibold text-sm mb-1">{msg.name}</p>
                            {msg.attachment?.type === 'image' && <Image src={msg.attachment.url} alt="attachment" width={200} height={200} className="rounded-md mb-2" />}
                            {msg.attachment?.type === 'video' && <video src={msg.attachment.url} controls className="rounded-md mb-2 w-full"></video>}
                            {msg.text && <p className="text-sm">{msg.text}</p>}
                            {msg.emoji && <p className="text-4xl">{msg.emoji}</p>}
                            <p className="text-xs text-right opacity-70 mt-1">{msg.timestamp}</p>
                        </div>
                        {msg.sender === 'Support' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setReplyingTo(msg)}><MessageSquareReply className="mr-2 h-4 w-4" /> Reply</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChatAction('forward')}><Forward className="mr-2 h-4 w-4" /> Forward</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                     {msg.sender === 'User' && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>{currentUser.avatar}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))}
        </CardContent>
        <div className="p-4 border-t bg-background">
            {replyingTo && (
                <div className="relative p-2 mb-2 text-sm rounded-md bg-secondary">
                    <p>Replying to <span className="font-bold">{replyingTo.name}</span></p>
                    <p className="truncate opacity-80">{replyingTo.text}</p>
                    <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6 rounded-full" onClick={() => setReplyingTo(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {attachment && (
                <div className="relative w-32 h-32 mb-2">
                    {attachment.type === 'image' && <Image src={attachment.url} alt="preview" fill objectFit="cover" className="rounded-md" />}
                    {attachment.type === 'video' && <video src={attachment.url} className="w-full h-full rounded-md" controls />}
                    <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setAttachment(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <div className="relative">
                <Input 
                    placeholder="Type a message..." 
                    className="pr-24"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <input type="file" ref={fileInputRef} onChange={handleAttachment} accept="image/*,video/*" className="hidden" />
                <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button size="icon" variant="ghost">
                                <Smile className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <div className="flex gap-2 p-2">
                            {emojis.map(emoji => (
                                <button key={emoji} onClick={() => handleSendEmoji(emoji)} className="text-2xl p-1 rounded-md hover:bg-secondary">
                                    {emoji}
                                </button>
                            ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
  )
}

    