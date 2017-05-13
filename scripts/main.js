(() => {

    window.addEventListener('load', () => {

        if (!Detector.webgl) Detector.addGetWebGLMessage();

        let width = window.innerWidth;
        let height = window.innerHeight;
        let targetDOM = document.getElementById('webgl');
        let xgrid = 20;
        let ygrid = 10;
        let meshLenght = xgrid * ygrid;
        let videoSizeW = 1280;
        let videoSizeH = 720;
        let meshPos = [];

        let scene;
        let camera;
        let renderer;
        let axis;
        let grid;
        let directionalLight;
        let controls;
        let video;
        let group;
        let plane;
        let planeGeometry;
        let planeMaterial;
        let sizeX;
        let sizeY;

        let CAMERA_PARAMETER = { // カメラに関するパラメータ
            fovy: 90,
            aspect: width / height,
            near: 0.1,
            far: 1000.0,
            x: 100.0, // + 右 , - 左
            y: 200.0, // + 上, - 下
            z: 500.0, // + 手前, - 奥
            lookAt: new THREE.Vector3(0.0, 0.0, 0.0) //x,y,z
        };

        let RENDERER_PARAMETER = { // レンダラに関するパラメータ
            clearColor: 0xffffff, //背景のリセットに使う色
            width: width,
            height: height
        };

        scene = new THREE.Scene();

        //カメラの設定
        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAMETER.fovy,
            CAMERA_PARAMETER.aspect,
            CAMERA_PARAMETER.near,
            CAMERA_PARAMETER.far
        );

        camera.position.x = CAMERA_PARAMETER.x;
        camera.position.y = CAMERA_PARAMETER.y;
        camera.position.z = CAMERA_PARAMETER.z;
        camera.lookAt(CAMERA_PARAMETER.lookAt); //注視点（どこをみてるの？）

        //レンダラーの設定
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAMETER.clearColor));
        renderer.setSize(RENDERER_PARAMETER.width, RENDERER_PARAMETER.height);
        renderer.shadowMapEnabled = true;
        //renderer.shadowMap.enabled = true; //影を有効
        targetDOM.appendChild(renderer.domElement); //canvasを挿入する

        //コントローラー
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, 300, 200);
        directionalLight.shadowMapWidth = 800; // これ!
        directionalLight.shadowMapHeight = 800; // これ!
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // var directionalLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        // scene.add(directionalLightShadowHelper);

        // var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
        // scene.add(directionalLightHelper);

        //videoをテクスチャとして設定
        video = document.getElementById('video');

        //texture = THREE.ImageUtils.loadTexture('images/11093012824.jpg');
        texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;

        sizeX = videoSizeW / xgrid;
        sizeY = videoSizeH / ygrid;

        group = new THREE.Group();
        //
        for (var i = 0; i < xgrid; i++) {
            for (var j = 0; j < ygrid; j++) {
                let geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeX);
                let material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, overdraw: true, side: THREE.DoubleSide });
                let mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.position.x = i * sizeX;
                mesh.position.y = j * sizeY;

                //初回の表示位置を残しておく
                meshPos.push({ x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
                //位置をランダムにする
                mesh.position.x = Math.random() * width;
                mesh.position.y = Math.random() * height;
                mesh.position.z = Math.random() * 200 - Math.random() * 200;
                mesh.rotation.x = Math.random() * 3;
                mesh.rotation.y = Math.random() * 3;
                mesh.rotation.z = Math.random() * 3;
                changeUvs(geometry, 1 / xgrid, 1 / ygrid, i, j);
                group.add(mesh);
            }
        }

        //グループをセンターに合わせる
        group.position.x = videoSizeW / 2 * -1;
        group.position.y = videoSizeH / 2 * -1;

        scene.add(group);

        //地面を作る
        // planeGeometry = new THREE.PlaneGeometry(10000, 10000);
        // planeMaterial = new THREE.MeshLambertMaterial({
        //     color: 0xFFFFFF,
        //     side: THREE.DoubleSide
        // });

        // plane = new THREE.Mesh(planeGeometry, planeMaterial);
        // plane.receiveShadow = true;
        // plane.rotation.set(Math.PI / 2, 0, 0);
        // plane.position.y = -130;
        // scene.add(plane);


        //テクスチャの描画位置を設定
        function changeUvs(geometry, unitx, unity, offsetx, offsety) {
            var faceVertexUvs = geometry.faceVertexUvs[0];
            for (var i = 0; i < faceVertexUvs.length; i++) {

                var uvs = faceVertexUvs[i];

                for (var j = 0; j < uvs.length; j++) {
                    var uv = uvs[j];
                    uv.x = (uv.x + offsetx) * unitx;
                    uv.y = (uv.y + offsety) * unity;
                }
            }
        }

        render();

        //描画
        function render() {
            // rendering
            renderer.render(scene, camera);

            for (let i = 0; i < meshLenght; i++) {
                let mesh = group.children[i];
                mesh.position.x += (meshPos[i].x - mesh.position.x) / 200;
                mesh.position.y += (meshPos[i].y - mesh.position.y) / 200;
                mesh.position.z += (meshPos[i].z - mesh.position.z) / 200;
                if (mesh.rotation.x > 0) {
                    mesh.rotation.x += (0 - 0.05) / 10;
                    mesh.rotation.y += (0 - 0.05) / 10;
                    mesh.rotation.z += (0 - 0.05) / 10;
                } else {
                    mesh.rotation.x = 0;
                    mesh.rotation.y = 0;
                    mesh.rotation.z = 0;
                }

            }

            // animation
            requestAnimationFrame(render);
        }

    }, false);
})();