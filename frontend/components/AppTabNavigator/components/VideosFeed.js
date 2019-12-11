import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  AsyncStorage
} from "react-native";
import {
  Card,
  CardItem,
  Thumbnail,
  Body,
  Left,
  Right,
  Button,
  Icon,
  Container,
  Header
} from "native-base";
import { Video } from "expo-av";
import {
  MaterialCommunityIcons,
  Ionicons,
  Entypo,
  Feather,
  FontAwesome
} from "@expo/vector-icons";
import { withNavigationFocus } from "react-navigation";
import { DOWNLOAD } from "../../Config";
import DirectMessage from "./DirectMessage";

import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

const { height, width } = Dimensions.get("window");

const cellHeight = height * 0.7;
const cellWidth = width;

const viewabilityConfig = {
  itemVisiblePercentThreshold: 80
};

export class Item extends React.PureComponent {
  state = {
    mute: true,
    shouldPlay: true,
    fullscreen: false
  };
  componentWillUnmount() {
    if (this.video) {
    }
  }

  async play() {
    const status = await this.video.getStatusAsync();
    if (status.isPlaying) {
      return;
    }
    return this.video.playAsync();
  }

  pause() {
    if (this.video) {
      this.video.pauseAsync();
    }
  }
  handleMute = () => {
    this.setState({
      mute: !this.state.mute
    });
  };
  render() {
    const { userid, url, caption } = this.props;
    const uri = url;

    return (
      <View styles={{ alignSelf: "center", justifyContent: "center" }}>
        <Card>
          <CardItem>
            <Left>
              <Thumbnail
                source={require("../../../assets/avatar.jpg")}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 50 / 2,
                  borderWidth: 2 / 3,
                  borderColor: "grey"
                }}
              />
              <Body>
                <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                  {userid}
                </Text>
                <Text note>MM/DD/YYYY</Text>
              </Body>
            </Left>
          </CardItem>
          <CardItem cardBody>
            <View style={styles.cell}>
              {!this.props.loading ? (
                <Video
                  ref={ref => {
                    this.video = ref;
                  }}
                  source={{ uri }}
                  shouldPlay={true}
                  isMuted={this.state.mute}
                  resizeMode="cover"
                  style={styles.full}
                  isLooping={true}
                />
              ) : (
                <ActivityIndicator
                  style={{ top: 50 }}
                  size="small"
                  color="#00ff00"
                />
              )}

              <View style={styles.underlay}>
                {!this.state.mute ? (
                  <MaterialCommunityIcons
                    name="volume-mute"
                    style={[styles.overlayText, { fontSize: 30, padding: 20 }]}
                    onPress={this.handleMute}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="volume-high"
                    style={[styles.overlayText, { fontSize: 30, padding: 20 }]}
                    onPress={this.handleMute}
                  />
                )}
              </View>
            </View>
          </CardItem>
          <View style={{ justifyContent: "center" }}>
            <CardItem>
              <Left>
                <Button transparent>
                  <Feather
                    name="heart"
                    style={{ color: "black", fontSize: 30 }}
                  />
                </Button>
                <Button transparent>
                  <MaterialCommunityIcons
                    name="comment-outline"
                    style={{
                      color: "black",
                      paddingTop: 6,
                      fontSize: 30,
                      transform: [{ rotateY: "180deg" }]
                    }}
                  />
                </Button>
                <Button transparent>
                  <FontAwesome
                    name="paper-plane-o"
                    onPress={() => {
                      this.props.nav.navigation.navigate("DirectMessage");
                    }}
                    style={{ color: "black", fontSize: 27 }}
                  />
                </Button>
              </Left>
            </CardItem>
          </View>
          <CardItem style={{ height: 10 }}>
            <Text>{this.props.likes}</Text>
          </CardItem>
          <CardItem>
            <Body>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ fontWeight: "bold", paddingRight: 5, fontSize: 15 }}
                >
                  {userid}
                </Text>
                <Text style={{ fontSize: 15 }}>{caption}</Text>
              </View>
            </Body>
          </CardItem>
        </Card>
      </View>
    );
  }
}

class VideosFeed extends React.PureComponent {
  state = {
    items: [],
    loading: true,
    videosDisplayed: [],
    refreshing: false
  };

  constructor(props) {
    super(props);
    this.cellRefs = {};
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentDidMount() {
    this.loadItems();
    setTimeout(this.loadItems, 1000);
    setTimeout(this.loadItems, 1100);
    setTimeout(this.loadItems, 1200);
    setTimeout(this.loadItems, 1300);
  }
  componentWillMount() {
    this.getVideos();
  }
  async getVideos() {
    try {
      const videoEntities = await fetch(
        "http://cosc-257-grp3.cs.amherst.edu:8080/feed"
      ).then(res => res.json());

      var updatedVideos = [];
      var videoEntity = {
        url: "",
        caption: ""
      };
      videoEntities.forEach(video => {
        videoEntity = {
          url: `${DOWNLOAD}${video.pathToVideo}`,
          caption: video.caption,
          id: video.videoIdentity.user.id
        };
        updatedVideos.push(videoEntity);
      });

      this.setState(
        {
          videosDisplayed: updatedVideos,
          loading: false,
          refreshing: false
        },
        function() {
          this.loadItems();
        }
      );
    } catch (e) {
      console.error("error loading videos", e);
    }
  }
  _onViewableItemsChanged = props => {
    const changed = props.changed;
    changed.forEach(item => {
      const cell = this.cellRefs[item.key];
      if (cell) {
        if (item.isViewable) {
          cell.play();
        } else {
          cell.pause();
        }
      }
    });
  };

  handleRefresh() {
    this.setState(
      {
        items: [],
        refreshing: true
      },
      function() {
        this.getVideos();
      }
    );
  }
  loadItems = () => {
    const newItems = this.state.videosDisplayed.map((item, i) => ({
      ...item,
      id: i,
      userid: item.id,
      caption: item.caption
    }));
    const items = [...newItems.reverse()];
    this.setState({ items, loading: false });
  };
  _renderItem = ({ item }) => {
    return (
      <Item
        nav={this.props}
        ref={ref => {
          this.cellRefs[item.id] = ref;
        }}
        {...item}
      />
    );
  };

  render() {
    const { items } = this.state;
    const { isFocused } = this.props;

    return (
      <Container style={styles.container}>
        <Header>
          <Left>
            <Icon
              name="camera"
              style={{ paddingLeft: 10, color: "transparent" }}
            ></Icon>
          </Left>
          <Body>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>MusicMe</Text>
          </Body>
          <Right>
            <FontAwesome
              name="paper-plane-o"
              style={{
                fontSize: 27,
                paddingRight: 10
              }}
              onPress={() => {
                this.props.navigation.navigate("DirectMessage");
              }}
            ></FontAwesome>
          </Right>
        </Header>
        <View style={styles.container}>
          {isFocused && (
            <FlatList
              style={{ flex: 1 }}
              extraData={this.state}
              data={items}
              renderItem={this._renderItem}
              keyExtractor={item => `${item.id}`}
              onViewableItemsChanged={this._onViewableItemsChanged}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={4}
              getItemLayout={(_data, index) => ({
                length: cellHeight,
                offset: cellHeight * index,
                index
              })}
              viewabilityConfig={viewabilityConfig}
              onRefresh={() => {
                this.handleRefresh();
              }}
              refreshing={this.state.refreshing}
              removeClippedSubviews={true}
            />
          )}
        </View>
      </Container>
    );
  }
}

const AppNavigator = createStackNavigator({
  VideosFeed: {
    screen: withNavigationFocus(VideosFeed),
    navigationOptions: {
      header: null
    }
  },
  DirectMessage: { screen: DirectMessage }
});

const AppContainer = createAppContainer(AppNavigator);

export default AppContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  cell: {
    width: cellWidth,
    height: cellHeight - 150,
    backgroundColor: "#eee",
    //borderRadius: 20,
    overflow: "hidden",
    //margin: 7,
    alignContent: "center",
    alignItems: "center"
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.1)"
    //padding: 20
  },
  underlay: {
    position: "absolute",
    right: 0,
    bottom: 0
    //padding: 20
  },
  full: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  poster: {
    resizeMode: "cover"
  },
  overlayText: {
    color: "#fff"
  }
});
