// pages/chat/chat.js
import getModelResponse from '../../api/chat.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: '',
    messages: [],
    sendButtonImage: '/images/up-arrow-none.png',
    isLoading: false,
    requestTask: null,
    courseList: [
      { id: 1, name: '机器学习基础' },
      { id: 2, name: '深度学习入门' },
      { id: 3, name: '自然语言处理' }
    ],
    selectedCourse: null,
    isQuote: false
  },
  bindCourseChange(e) {
    const index = e.detail.value
    this.setData({
      selectedCourse: index
    })
  },
  onInputChange(e) {
    const inputValue = e.detail.value;
    this.setData({
      inputValue: inputValue,
      sendButtonImage: inputValue ? '/images/up-arrow.png' : '/images/up-arrow-none.png'
    });
  },
  onDelete() {
    this.setData({
      messages: []
    });
  },
  onTransfer() {
    
  },
  onCopy(e) {
    const index = e.currentTarget.dataset.index;
    const message = this.data.messages[index];
    wx.setClipboardData({
      data: message.content,
      success: function () {
        wx.showToast({
          title: '复制成功',
          icon: 'none',
          duration: 1500
        });
      },
      fail: function () {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },
  onQuote(e) {
    this.setData({
      isQuote: true
    })
  },
  closeContext(e) {
    this.setData({
      isQuote: false
    })
  },
  onRefresh(e) {
    const type = e.currentTarget.dataset.type;
    const index = e.currentTarget.dataset.index;
    let messagePair = [];
    if (type === 'user') {
      const aiMessageIndex = index + 1;
      messagePair = [this.data.messages[index], this.data.messages[aiMessageIndex]];
    } else {
      const userMessageIndex = index - 1;
      messagePair = [this.data.messages[userMessageIndex], this.data.messages[index]];
    }
    const updatedMessages = this.data.messages.filter(
      (msg, i) => i !== index && i !== (type === 'user' ? index + 1 : index - 1)
    );
    this.setData({
      messages: updatedMessages,
    });
    this.onSendMessage(messagePair[0].content);
  },
  onSendMessage(message) {
    if (message && message.type === "tap")
      message = null;
    const inputMessage = message ?? this.data.inputValue?.trim();
    const history = this.data.messages.map(msg => ({ role: msg.type, content: msg.content }));
    if (!inputMessage) {
      return;
    }
    this.setData({
      inputValue: '',
      isLoading: true,
      sendButtonImage: '/images/loading.png',
    });
    this.addMessage(inputMessage, 'user');
    const { promise, requestTask } = getModelResponse({ 
      question: inputMessage,
      history: history,
    })
    this.setData({ requestTask });
    promise
      .then((res) => {
        this.addMessage(res.answer, 'ai', res.context);
      })
      .catch((err) => {
        this.addMessage(err.error, 'ai');
      })
      .finally(() => {
        this.setData({
          isLoading: false,
          sendButtonImage: '/images/up-arrow-none.png',
          requestTask: null,
        });
      });
  },  
  addMessage(content, type, context) {
    const newMessage = { content, type, context };
    this.setData({
      messages: [...this.data.messages, newMessage],
    });
  },
  onAbort() {
    const requestTask = this.data.requestTask;
    if (requestTask) {
      requestTask.abort();
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})