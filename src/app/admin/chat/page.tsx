
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Smile, Paperclip, MoreHorizontal, MessageSquareReply, Forward, X } from "lucide-react"
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { app } from "@/lib/firebase";
import { getDatabase, ref, onValue, off, push, set, serverTimestamp } from "firebase/database";
import { Badge } from "@/components/ui/badge";

interface RepliedTo {
    name: string;
    text: string;
    role: 'User' | 'Admin' | 'Owner';
}

interface Message {
    id: string;
    senderId: string;
    role: 'User' | 'Admin' | 'Owner';
    name: string;
    avatar: string;
    text: string;
    timestamp: any;
    attachment?: {
        type: 'image' | 'video';
        url: string;
    };
    emoji?: string;
    repliedTo?: RepliedTo;
}

const emojis = ['👍', '❤️', '😂', '🎉', '😢', '🔥'];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adminStr = localStorage.getItem('currentAdmin');
    if(adminStr){
        setCurrentUser(JSON.parse(adminStr));
    }
  }, []);

  useEffect(() => {
    const db = getDatabase(app);
    const chatRef = ref(db, 'unifiedChat');

    const listener = onValue(chatRef, (snapshot) => {
        if(snapshot.exists()){
            const data = snapshot.val();
            const messageList: Message[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a,b) => a.timestamp - b.timestamp);
            setMessages(messageList);
        } else {
            setMessages([]);
        }
    });

    return () => off(chatRef, 'value', listener);
  }, []);

   useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string, emoji?: string) => {
    if (!currentUser || !currentUser.id) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send message. User not identified.",
        });
        return;
    }
    if (!text.trim() && !attachment && !emoji) {
        return;
    }

    const db = getDatabase(app);
    const chatRef = ref(db, 'unifiedChat');
    const newMsgRef = push(chatRef);

    const newMsg: any = {
        senderId: currentUser.id,
        role: 'Admin',
        name: currentUser.name,
        avatar: currentUser.name.charAt(0).toUpperCase(),
        text: text,
        timestamp: serverTimestamp(),
    };

    if (attachment) {
        newMsg.attachment = attachment;
    }
    if (emoji) {
        newMsg.emoji = emoji;
    }
    if (replyingTo) {
        newMsg.repliedTo = { name: replyingTo.name, text: replyingTo.text, role: replyingTo.role };
    }

    set(newMsgRef, newMsg);
    setNewMessage('');
    setAttachment(null);
    setReplyingTo(null);
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

  const getRoleBadgeVariant = (role: 'User' | 'Admin' | 'Owner') => {
    switch (role) {
        case 'Owner': return 'destructive';
        case 'Admin': return 'secondary';
        case 'User': return 'outline';
        default: return 'default';
    }
  }

  return (
    <div className="flex-1 p-4 sm:p-8 pt-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Live Chat</h2>
      </div>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Unified Communication Channel</CardTitle>
          <CardDescription>Chat with users, other admins, and the owner in real-time.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto p-4">
            {messages.map((msg) => {
                const isYou = msg.senderId === currentUser?.id;
                return (
                 <div key={msg.id} className={`group flex items-start gap-3 ${isYou ? 'justify-end' : 'justify-start'}`}>
                    {!isYou && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${msg.avatar}`} />
                            <AvatarFallback>{msg.avatar}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`flex flex-col gap-1 ${isYou ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                             {isYou && (
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
                            <div className={`p-3 rounded-lg max-w-[80%] sm:max-w-xs md:max-w-md ${isYou ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                {msg.repliedTo && (
                                    <div className="p-2 mb-2 text-sm rounded-md bg-black/20">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold">{msg.repliedTo.name}</p>
                                            <Badge variant={getRoleBadgeVariant(msg.repliedTo.role)} className="text-xs">{msg.repliedTo.role}</Badge>
                                        </div>
                                        <p className="truncate opacity-80">{msg.repliedTo.text}</p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-1 gap-2">
                                    <p className="font-semibold text-sm">{msg.name}</p>
                                    <Badge variant={getRoleBadgeVariant(msg.role)} className="text-xs">{msg.role}</Badge>
                                </div>
                                {msg.attachment?.type === 'image' && <Image src={msg.attachment.url} alt="attachment" width={200} height={200} className="rounded-md mb-2" />}
                                {msg.attachment?.type === 'video' && <video src={msg.attachment.url} controls className="rounded-md mb-2 w-full"></video>}
                                {msg.text && <p>{msg.text}</p>}
                                {msg.emoji && <p className="text-4xl">{msg.emoji}</p>}
                                <p className="text-xs text-right opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                              {!isYou && (
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
                    </div>
                     {isYou && currentUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${currentUser.name.charAt(0)}`} />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            )})}
            <div ref={messagesEndRef} />
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
                    disabled={!currentUser}
                />
                 <input type="file" ref={fileInputRef} onChange={handleAttachment} accept="image/*,video/*" className="hidden" />
                <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button size="icon" variant="ghost" disabled={!currentUser}>
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
                     <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={!currentUser}>
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button size="icon" onClick={handleSendMessage} disabled={!currentUser}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
      </Card>
    </div>
  )
}
