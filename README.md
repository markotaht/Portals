# Portals

Project page:
https://courses.cs.ut.ee/2016/cg/fall/Main/Project-Portals

Demo:
http://kodu.ut.ee/~dianx93/Arvutigraafika/Portals/

Controls:
* W, A, S, D - move
* left & right arrow - turn left/right
* E, Q - move up/down
* shift - sprint/faster movement
* up & down arrow - scale portals
* z - change portal 1 location
* x - change portal 2 location

## Report

### Topic description

The goal of this project was to create a working demo to show how a portal system could be made using Javascript and ThreeJS. The portals should look relatively realistic and you should be able to go through them.

### Tools and methods used

Language: Javascript

Graphics library: ThreeJS

Extensions used: THREEx.KeyboardState for movement

Methods used: Stencil buffer for portals, ray tracing for teleportation

### Issues (and solutions)

#### Showing the view through the second portal in the first one

For the view through portals to be realistic (right scale, angle etc), we used stencil buffer to render the portals.

We calculate our cameras relative angle and position based on portal 1. We place our camera so that we would still have the same relative position and angle based on portal 2. We now can render the image for portal 1. Now we reset camera position back to the original. We do the same thing we did before but this time we take the relative position and angle based on portal 2.

This method took a lot of time to set up correctly so that all the positionings would be correct.

#### Recursive portals

Using stencil buffer as described above, we now had realistic portals but the scene visible through a portal didn’t show any portals even when some should be visible. To show portals recursively, we first render one portal, then calculate our position as if we had gone through the portal and then render into stencil buffer again. We did this 4 times to get a depth of 4 portals. And from bottom up we started to render scene in. 

#### Teleporting

The main issue with teleporting was identifying when to teleport the camera to another portal. This means deciding if camera is close enough to a portal. We decided to solve this using ray tracing to detect collisions with portals and get distance from them. Also time delay between teleportations was added so after teleporting to another portal the camera would not just immediately teleport back.

#### Oblique frustum culling

For displaying portals, we use a virtual camera to look at a portal. If there is an object between the virtual camera and the portal, the camera sees it and it will be displayed on the portal even though it should not be visible. To fix this, we wanted to use oblique frustum culling. To get oblique frustum culling we tried three different approaches. 

Two approaches modified the camera’s projection matrix. The difference between them was how the clipping plane was calculated. First approach was manually calculating every single value and then putting them into the projection matrix, second one was to use some ThreeJS built-in classes to do some of the calculations for us. But still, nothing changed.

Third approach was to use WebGLRenderers property called clippingPlanes. It had some success, but still it didn’t give the result in the condition we needed.

In the end we didn’t get oblique frustum culling to work.

### Contributions

#### Marko Täht
* Portals
* Recursive portals
* Oblique frustum culling

#### Diana Algma
* Designed the scene
* Lighting
* Helped with portals and oblique frustum culling

#### Märt Sessman
* Added keyboard movement using THREEx.KeyboardState
* Teleporting using ray tracing
* Moving portals and placing them on objects
