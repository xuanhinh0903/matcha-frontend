import React from 'react';
import MessageList from './MessageList';

// Export a memoized version of the MessageList component
const MessageListMemo = React.memo(MessageList);

export { MessageListMemo as MessageList };
