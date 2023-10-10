interface ISiteMetadataResult {
  siteTitle: string;
  siteUrl: string;
  description: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
}

const data: ISiteMetadataResult = {
  siteTitle: '路古在路上',
  siteUrl: 'https://quitino.github.io',
  logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTtc69JxHNcmN1ETpMUX4dozAgAN6iPjWalQ&usqp=CAU',
  description: 'Personal site and blog',
  navLinks: [
    {
      name: '主页',
      url: 'https://quitino.github.io',
    },
    {
      name: '跑步周记',
      url: 'https://quitino.github.io/category/#%E6%8A%98%E8%BF%94%E7%82%B9',
    },
    {
      name: '关于',
      url: 'https://quitino.github.io/about',
    },
  ],
};

export default data;
