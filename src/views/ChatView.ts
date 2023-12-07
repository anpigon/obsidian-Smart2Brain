import { WorkspaceLeaf, type HoverParent, HoverPopover, TextFileView, TFile } from 'obsidian';

import ChatViewComponent from '../components/ChatView.svelte';
import { plugin, messages, type Message } from '../store';

export const VIEW_TYPE_CHAT = 'chat-view';

// TODO: think about System message
export const DEFAULT_DATA = 'Assistant\nHallo, wie kann ich dir helfen?\n- - - - -';

export class ChatView extends TextFileView implements HoverParent {
    component: ChatViewComponent;
    hoverPopover: HoverPopover | null;
    data: string = DEFAULT_DATA;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.icon = 'message-square';
    }

    getViewType() {
        return VIEW_TYPE_CHAT;
    }

    setViewData(data: string, clear: boolean): void {
        this.data = data;
        // parse data into messages
        const chatMessages: Message[] = data
            .split('- - - - -')
            .map((message) => message.trim())
            .filter((message) => message.length > 0)
            .map((message) => {
                // message can have multiple lines
                const lines = message.split('\n');
                const role = lines[0];
                const content = lines.slice(1).join('\n');
                return {
                    role,
                    content,
                } as Message;
            });
        messages.set(chatMessages);

        if (clear) {
            this.clear();
        }
    }

    getViewData(): string {
        messages.subscribe((messages) => {
            const chatHistory = messages.map((chatMessage) => {
                return `${chatMessage.role}\n${chatMessage.content}\n- - - - -`;
            });
            this.data = chatHistory.join('\n');
        });
        return this.data;
    }

    clear(): void {
        // this.setViewData(DEFAULT_DATA, false);
        // TODO clear component
    }

    getDisplayText() {
        return 'Chat Second Brain';
    }

    async onLoadFile(file: TFile) {
        await super.onLoadFile(file);
        this.component = new ChatViewComponent({
            target: this.contentEl,
        });
    }

    // async onUnloadFile(file: TFile) {
    //     this.clear();
    // }
    //
}
