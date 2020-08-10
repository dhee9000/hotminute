import React from 'react';
import { View, ActivityIndicator, ImageBackground, Dimensions, TouchableHighlight, TouchableOpacity, Image, Animated, Easing, ScrollView } from 'react-native';

import { Text } from '../common/components';

import { connect } from 'react-redux';
import * as ActionTypes from '../../redux/ActionTypes';
import * as States from '../../redux/ActionTypes';
import { Colors, Fonts } from '../../config';

import { Button, Icon } from 'react-native-elements';

import WelcomeSVG from '../../../assets/svg/WelcomeBackground.svg';

const { width, height } = Dimensions.get('screen');

const BACKGROUND_IMAGE_URI = 'https://m.economictimes.com/thumb/msid-64168358,width-1200,height-900,resizemode-4,imgsize-243202/magazines/panache/lingo-jingo-update-your-dictionary-with-these-new-age-dating-terms/breadcrumbing-orbiting-and-more-update-your-dating-dictionary-with-these-new-age-terms/lingo-jingo-update-your-dictionary-with-these-new-age-dating-terms.jpg';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { LinearGradient } from 'expo-linear-gradient';

import Heart from '../../../assets/svg/heart.svg';

class Start extends React.Component {

    state = {
        signedIn: auth().currentUser ? true : false,
        profileFetched: false,
    }

    enterAnimation = new Animated.Value(0);

    async componentDidMount() {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        let token = await messaging().getToken();
        console.log(token);
        setTimeout(() =>
            Animated.timing(this.enterAnimation, {
                toValue: 1,
                duration: 1000,
                easing: Easing.ease,
                useNativeDriver: true,
            }).start(), 500);
        if (auth().currentUser) {
            let profileSnapshot = await firestore().collection('profiles').doc(auth().currentUser.uid).get();
            let profileData = profileSnapshot.data();
            if (profileSnapshot.exists && profileData.profileComplete) {
                this.setState({ profileFetched: true, ...profileData });
                this.props.navigation.navigate('Main');
            }
        }
    }

    signOutPressed = async () => {
        await auth().signOut();
        this.setState({ signedIn: false });
    }

    onGetStartedPressed = async () => {
        if (auth().currentUser) {
            if (this.state.profileComplete) {
                this.props.navigation.navigate('Main');
            }
            else {
                this.props.navigation.navigate('CreateProfileName');
            }
        }
        else {
            this.props.navigation.navigate('Login');
        }
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'flex-start', alignItems: 'center' }}>
                <Heart height={64} width={64} />
                <Text style={{ fontFamily: Fonts.heading, fontSize: 24, textAlign: 'center', marginBottom: 24.0, color: Colors.primary }}>welcome to hotminute</Text>
                <View style={{ height: 400.0, width: width * 0.9, borderWidth: 4.0, borderColor: Colors.textLightGray, padding: 16.0, backgroundColor: '#33333355' }}>
                    <ScrollView contentContainerStyle={{ padding: 16.0 }}>
                        <Text style={{ fontFamily: Fonts.heading, fontSize: 24, textAlign: 'center', marginVertical: 24.0 }}>Terms of Use</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <Text style={{ flex: 1, flexWrap: 'wrap' }}>
                                Welcome to HotMinute - Dating, operated by Hot Minute LLC (“us,” “we,” the “Company” or “HotMinute”).{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>1. Acceptance of Terms of Use Agreement.{'\n'}</Text>
                                By creating a HotMinute - Dating account or by using any HotMinute - Dating service, whether through a mobile device, mobile application or computer (collectively, the “Service”) you agree to be bound by (i) these Terms of Use, and (ii) our Privacy Policy, each of which is incorporated by reference into this Agreement. If you do not accept and agree to be bound by all of the terms of this Agreement, you should not use the Service.
                                    We may make changes to this Agreement and to the Service from time to time. We may do this for a variety of reasons including to reflect changes in or requirements of the law, new features, or changes in business practices. The most recent version of this Agreement will be posted on the Service under Settings and also on hotminute.app, and you should regularly check for the most recent version. The most recent version is the version that applies. If the changes include material changes that affect your rights or obligations, we will notify you in advance of the changes by reasonable means, which could include notification through the Service or via email. If you continue to use the Service after the changes become effective, then you agree to the revised Agreement. You agree that this Agreement shall supersede any prior agreements (except as specifically stated herein), and shall govern your entire relationship with HotMinute - Dating, including but not limited to events, agreements, and conduct preceding your acceptance of this Agreement.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>2. Eligibility.{'\n'}</Text>
                                You must be at least 18 years of age to create an account on HotMinute - Dating and use the Service. By creating an account and using the Service, you represent and warrant that:
                                you can form a binding contract with HotMinute - Dating,
                                you are not a person who is barred from using the Service under the laws of the United States or any other applicable jurisdiction–meaning that you do not appear on the U.S. Treasury Department’s list of Specially Designated Nationals or face any other similar prohibition,
                                you will comply with this Agreement and all applicable local, state, national and international laws, rules and regulations, and
                                    you have never been convicted of or pled no contest to a felony, a sex crime, or any crime involving violence, and that you are not required to register as a sex offender with any state, federal or local sex offender registry.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>3. Your Account.{'\n'}</Text>
                                You are responsible for maintaining the confidentiality of your login credentials you use to sign up for HotMinute - Dating, and you are solely responsible for all activities that occur under those credentials. If you think someone has gained access to your account, please immediately contact us.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>4. Modifying the Service and Termination.{'\n'}</Text>
                                HotMinute - Dating is always striving to improve the Service and bring you additional functionality that you will find engaging and useful. This means we may add new product features or enhancements from time to time as well as remove some features, and if these actions do not materially affect your rights or obligations, we may not provide you with notice before taking them. We may even suspend the Service entirely, in which event we will notify you in advance unless extenuating circumstances, such as safety or security concerns, prevent us from doing so.
                                You may terminate your account at any time, for any reason, by following the instructions in “Settings” in the Service.
                                    HotMinute - Dating may terminate your account at any time without notice if it believes that you have violated this Agreement. After your account is terminated, this Agreement will terminate.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>5. Safety; Your Interactions with Other Members.{'\n'}</Text>
                                Though HotMinute - Dating strives to encourage a respectful member experience through features like the double opt-in that allows members to communicate only after they have both indicated interest in one another, it is not responsible for the conduct of any member on or off of the Service. You agree to use caution in all interactions with other members, particularly if you decide to communicate off the Service or meet in person. In addition, you agree to review and follow HotMinute - Dating’s prior to using the Service. You agree that you will not provide your financial information (for example, your credit card or bank account information), or wire or otherwise send money, to other members.
                                    YOU ARE SOLELY RESPONSIBLE FOR YOUR INTERACTIONS WITH OTHER MEMBERS. YOU UNDERSTAND THAT HOTMINUTE - DATING DOES NOT CONDUCT CRIMINAL BACKGROUND CHECKS ON ITS MEMBERS OR OTHERWISE INQUIRE INTO THE BACKGROUND OF ITS MEMBERS. HOTMINUTE - DATING MAKES NO REPRESENTATIONS OR WARRANTIES AS TO THE CONDUCT OF MEMBERS. HOTMINUTE - DATING RESERVES THE RIGHT TO CONDUCT – AND YOU AUTHORIZE HOTMINUTE - DATING TO CONDUCT – ANY CRIMINAL BACKGROUND CHECK OR OTHER SCREENINGS (SUCH AS SEX OFFENDER REGISTER SEARCHES) AT ANY TIME USING AVAILABLE PUBLIC RECORDS OBTAINED BY IT OR WITH THE ASSISTANCE OF A CONSUMER REPORTING AGENCY, AND YOU AGREE THAT ANY INFORMATION YOU PROVIDE MAY BE USED FOR THAT PURPOSE.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>6. Rights HotMinute - Dating Grants You.{'\n'}</Text>
                                HotMinute - Dating grants you a personal, worldwide, royalty-free, non-assignable, nonexclusive, revocable, and non-sublicensable license to access and use the Service. This license is for the sole purpose of letting you use and enjoy the Service’s benefits as intended by HotMinute - Dating and permitted by this Agreement. Therefore, you agree not to:
                                use the Service or any content contained in the Service for any commercial purposes without our written consent.
                                copy, modify, transmit, create any derivative works from, make use of, or reproduce in any way any copyrighted material, images, trademarks, trade names, service marks, or other intellectual property, content or proprietary information accessible through the Service without HotMinute - Dating’s prior written consent.
                                express or imply that any statements you make are endorsed by HotMinute - Dating.
                                use any robot, bot, spider, crawler, scraper, site search/retrieval application, proxy or other manual or automatic device, method or process to access, retrieve, index, “data mine,” or in any way reproduce or circumvent the navigational structure or presentation of the Service or its contents.
                                use the Service in any way that could interfere with, disrupt or negatively affect the Service or the servers or networks connected to the Service.
                                upload viruses or other malicious code or otherwise compromise the security of the Service.
                                forge headers or otherwise manipulate identifiers in order to disguise the origin of any information transmitted to or through the Service.
                                “frame” or “mirror” any part of the Service without HotMinute - Dating’s prior written authorization.
                                use meta tags or code or other devices containing any reference to HotMinute - Dating or the Service (or any trademark, trade name, service mark, logo or slogan of HotMinute - Dating) to direct any person to any other website for any purpose.
                                modify, adapt, sublicense, translate, sell, reverse engineer, decipher, decompile or otherwise disassemble any portion of the Service, or cause others to do so.
                                use or develop any third-party applications that interact with the Service or other members’ Content or information without our written consent.
                                use, access, or publish the HotMinute - Dating application programming interface without our written consent.
                                probe, scan or test the vulnerability of our Service or any system or network.
                                encourage or promote any activity that violates this Agreement.
                                HotMinute - Dating may investigate and take any available legal action in response to illegal and/ or unauthorized uses of the Service, including termination of your account.
                                    Any software that we provide you may automatically download and install upgrades, updates, or other new features. You may be able to adjust these automatic downloads through your device’s settings.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>7. Rights you Grant HotMinute - Dating.{'\n'}</Text>
                                By creating an account, you grant to HotMinute - Dating a worldwide, transferable, sub-licensable, royalty-free, right and license to host, store, use, copy, display, reproduce, adapt, edit, publish, modify and distribute information you authorize us to access, as well as any information you post, upload, display or otherwise make available (collectively, “post”) on the Service or transmit to other members (collectively, “Content”). HotMinute - Dating’s license to your Content shall be non-exclusive, except that HotMinute - Dating’s license shall be exclusive with respect to derivative works created through use of the Service. For example, HotMinute - Dating would have an exclusive license to screenshots of the Service that include your Content. In addition, so that HotMinute - Dating can prevent the use of your Content outside of the Service, you authorize HotMinute - Dating to act on your behalf with respect to infringing uses of your Content taken from the Service by other members or third parties. This expressly includes the authority, but not the obligation, to send notices pursuant on your behalf if your Content is taken and used by third parties outside of the Service. Our license to your Content is subject to your rights under applicable law (for example laws regarding personal data protection to the extent any Content contains personal information as defined by those laws) and is for the limited purpose of operating, developing, providing, and improving the Service and researching and developing new ones. You agree that any Content you place or that you authorize us to place on the Service may be viewed by other members and may be viewed by any person visiting or participating in the Service (such as individuals who may receive shared Content from other HotMinute - Dating members).
                                You agree that all information that you submit upon creation of your account is accurate and truthful and you have the right to post the Content on the Service and grant the license to HotMinute - Dating above.
                                You understand and agree that we may monitor or review any Content you post as part of a Service. We may delete any Content, in whole or in part, that in our sole judgment violates this Agreement or may harm the reputation of the Service.
                                When communicating with our customer care representatives, you agree to be respectful and kind. If we feel that your behavior towards any of our customer care representatives or other employees is at any time threatening or offensive, we reserve the right to immediately terminate your account.
                                In consideration for HotMinute - Dating allowing you to use the Service, you agree that we, our affiliates, may place advertising on the Service. By submitting suggestions or feedback to HotMinute - Dating regarding our Service, you agree that HotMinute - Dating may use and share such feedback for any purpose without compensating you.
                                    You agree that HotMinute - Dating may access, preserve and disclose your account information and Content if required to do so by law or in a good faith belief that such access, preservation or disclosure is reasonably necessary, such as to: (i) comply with legal process; (ii) enforce this Agreement; (iii) respond to claims that any Content violates the rights of third parties; (iv) respond to your requests for customer service; or (v) protect the rights, property or personal safety of the Company or any other person.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>8. Community Rules.{'\n'}</Text>
                                By using the Service, you agree that you will not:
                                use the Service for any purpose that is illegal or prohibited by this Agreement.
                                use the Service for any harmful or nefarious purpose.
                                use the Service in order to damage HotMinute - Dating.
                                violate our Community Guidelines , as updated from time to time.
                                spam, solicit money from or defraud any members.
                                impersonate any person or entity or post any images of another person without his or her permission.
                                bully, “stalk,” intimidate, assault, harass, mistreat or defame any person.
                                post any Content that violates or infringes anyone’s rights, including rights of publicity, privacy, copyright, trademark or other intellectual property or contract right.
                                post any Content that is hate speech, threatening, sexually explicit or pornographic; incites violence; or contains nudity or graphic or gratuitous violence.
                                post any Content that promotes racism, bigotry, hatred or physical harm of any kind against any group or individual.
                                solicit passwords for any purpose, or personal identifying information for commercial or unlawful purposes from other users or disseminate another person’s personal information without his or her permission.
                                use another user’s account, share an account with another user, or maintain more than one account.
                                create another account if we have already terminated your account, unless you have our permission.
                                    HotMinute - Dating reserves the right to investigate and/ or terminate your account if you have violated this Agreement, misused the Service or behaved in a way that HotMinute - Dating regards as inappropriate or unlawful, including actions or communications that occur on or off the Service.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>9. Other Members’ Content.{'\n'}</Text>
                                Although HotMinute - Dating reserves the right to review and remove Content that violates this Agreement, such Content is the sole responsibility of the member who posts it, and HotMinute - Dating cannot guarantee that all Content will comply with this Agreement. If you see Content on the Service that violates this Agreement, please report it within the Service.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>10. Notice and Procedure for Making Claims of Copyright Infringement.{'\n'}</Text>
                                If you believe that your work has been copied and posted on the Service in a way that constitutes copyright infringement, please provide our Copyright Agent with the following information:
                                an electronic or physical signature of the person authorized to act on behalf of the owner of the copyright interest;
                                a description of the copyrighted work that you claim has been infringed;
                                a description of where the material that you claim is infringing is located on the Service (and such description must be reasonably sufficient to enable us to find the alleged infringing material);
                                your contact information, including address, telephone number and email address;
                                a written statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law; and
                                a statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner’s behalf.
                                Notice of claims of copyright infringement should be provided to the Company’s Copyright Agent via email to info@hotminute.app.
                                    HotMinute - Dating will terminate the accounts of repeat infringers.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>11. Disclaimers.{'\n'}</Text>
                                HOTMINUTE - DATING PROVIDES THE SERVICE ON AN “AS IS” AND “AS AVAILABLE” BASIS AND TO THE EXTENT PERMITTED BY APPLICABLE LAW, GRANTS NO WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE WITH RESPECT TO THE SERVICE (INCLUDING ALL CONTENT CONTAINED THEREIN), INCLUDING, WITHOUT LIMITATION, ANY IMPLIED WARRANTIES OF SATISFACTORY QUALITY, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT. HOTMINUTE - DATING DOES NOT REPRESENT OR WARRANT THAT (A) THE SERVICE WILL BE UNINTERRUPTED, SECURE OR ERROR FREE, (B) ANY DEFECTS OR ERRORS IN THE SERVICE WILL BE CORRECTED, OR (C) THAT ANY CONTENT OR INFORMATION YOU OBTAIN ON OR THROUGH THE SERVICE WILL BE ACCURATE.
                                HOTMINUTE - DATING TAKES NO RESPONSIBILITY FOR ANY CONTENT THAT YOU OR ANOTHER MEMBER OR THIRD PARTY POSTS, SENDS OR RECEIVES THROUGH THE SERVICE. ANY MATERIAL DOWNLOADED OR OTHERWISE OBTAINED THROUGH THE USE OF THE SERVICE IS ACCESSED AT YOUR OWN DISCRETION AND RISK.
                                    HOTMINUTE - DATING DISCLAIMS AND TAKES NO RESPONSIBILITY FOR ANY CONDUCT OF YOU OR ANY OTHER MEMBER, ON OR OFF THE SERVICE.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>12. Governing Law.{'\n'}</Text>
                                Except where our arbitration agreement is prohibited by law, the laws of Texas, U.S.A., without regard to its conflict of laws rules, shall apply to any disputes arising out of or relating to this Agreement, the Service, or your relationship with HotMinute - Dating. Notwithstanding the foregoing, the Arbitration Agreement in Section 15 above shall be governed by the Federal Arbitration Act.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>13. Venue.{'\n'}</Text>
                                Except for claims that may be properly brought in a small claims court of competent jurisdiction, all claims arising out of or relating to this Agreement, to the Service, or to your relationship with that for HotMinute - Dating whatever reason are not submitted to arbitration will be litigated exclusively in the federal or state courts of Harris County, Texas, U.S. You and HotMinute - Dating consent to the exercise of personal jurisdiction of courts in the State of Texas and waive any claim that such courts constitute an inconvenient forum.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>14. Indemnity by You.{'\n'}</Text>
                                You agree, to the extent permitted under applicable law, to indemnify, defend and hold harmless HotMinute - Dating, our affiliates, and their and our respective directors, and employees from and against any and all complaints, demands, claims, damages, losses, costs, liabilities and expenses, including attorney’s fees, due to, arising out of, or relating in any way to your access to or use of the Service, your Content, or your breach of this Agreement.{'\n'}
                                < Text style={{ marginBottom: 16, fontFamily: Fonts.heading, fontSize: 30, justifyContent: 'center', alignItems: 'center', marginLeft: 100 }}>15. Entire Agreement; Other.{'\n'}</Text>
                                This Agreement, along with the Privacy Policy and any terms disclosed to you, contains the entire agreement between you and HotMinute - Dating regarding your relationship with HotMinute - Dating and the use of the Service, with the following exception: anyone who opted out of the retroactive application of is still subject to and bound by any prior agreements to arbitrate with HotMinute - Dating as well as this agreement to arbitrate on a going forward basis. If any provision of this Agreement is held invalid, the remainder of this Agreement shall continue in full force and effect. The failure of HotMinute - Dating to exercise or enforce any right or provision of this Agreement shall not constitute a waiver of such right or provision. You agree that your HotMinute - Dating account is non-transferable and all of your rights to your account and its Content terminate upon your death. No agency, partnership, joint venture, fiduciary or other special relationship or employment is created as a result of this Agreement and you may not make any representations on behalf of or bind HotMinute - Dating in any manner.{'\n'}
                            </Text>
                        </View>
                    </ScrollView>
                </View>


                <View style={{ position: 'absolute', width, paddingHorizontal: 16.0, bottom: 16, alignContent: 'stretch', marginBottom: 16.0 }}>
                    {this.state.signedIn ? <Text style={{ color: Colors.textLightGray, fontSize: 10.0, alignSelf: 'center', marginBottom: 4.0 }}>Signed in as {this.state.profileFetched ? `${this.state.fname} ${this.state.lname}` : auth().currentUser.uid} <Text style={{ fontSize: 10.0, color: Colors.textLightGray, textDecorationLine: 'underline' }} onPress={this.signOutPressed}>Sign Out</Text></Text> : null}
                    <TouchableOpacity onPress={this.onGetStartedPressed} onLongPress={() => this.props.navigation.navigate('GodMode')}>
                        <LinearGradient style={{ margin: 2.0, paddingVertical: 8.0, borderRadius: 28.0, height: 48, justifyContent: 'center', alignItems: 'center', width: '100%' }} colors={[Colors.primaryDark, Colors.primary]}>
                            <Text style={{ fontFamily: Fonts.heading, color: Colors.background }}>I Accept</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View >
        )
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Start);